# backend/main.py (FINAL FIXED CODE: Enforced Consensus Statement Logic)
import os
import aiofiles
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
import json

# --- Configuration ---
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("Warning: GEMINI_API_KEY not found in .env file. API calls will fail.")
    
app = FastAPI(title="AI Systematic Review Engine MVP")

# Configure CORS (Crucial for React connection)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  
        "https://ai-systematic-review-evidence-contr.vercel.app/", # <-- Paste your live Vercel URL here
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini Client (handle missing key gracefully for local test)
client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None
MODEL = 'gemini-2.5-flash' 

# --- Pydantic Models for Structured Output ---

# Defines the expected output structure for a single trial extraction
class PicoOExtraction(BaseModel):
    study_id: str = Field(description="A unique identifier for the study (e.g., Trial X).")
    population: str = Field(description="Key characteristics of the study population (max 2 sentences).")
    intervention: str = Field(description="The drug or treatment being tested (max 2 sentences).")
    comparator: str = Field(description="The control group (e.g., Placebo, Standard Care) (max 1 sentence).")
    outcome: str = Field(description="The primary outcome reported, focusing on effect, p-value, HR, or RR (max 2 concise sentences).")
    extraction_notes: str = Field(description="Brief notes on the certainty or bias observed (max 1 sentence).")

# --- MISSING CLASS ADDED HERE ---
# Defines the expected input structure for the contradiction endpoint
class ContradictionInput(BaseModel):
    # This class wraps the list of PicoOExtraction objects sent from the frontend
    studies: list[PicoOExtraction]
# --------------------------------

# --- NEW MODELS FOR HIGH-VALUE OUTPUT DATA ---

class OutcomeMapData(BaseModel):
    study_id: str = Field(description="ID of the study.")
    outcome_label: str = Field(description="The primary outcome measured (e.g., MACE).")
    effect_direction: str = Field(description="Categorical net effect: 'Benefit', 'Harm', or 'Neutral/No Effect'.")

class ForestPlotData(BaseModel):
    study_id: str = Field(description="ID of the study.")
    effect_estimate: float = Field(description="The point estimate (e.g., Hazard Ratio or Relative Risk, must be a number).")
    ci_lower: float = Field(description="95% Confidence Interval lower bound (must be a number).")
    ci_upper: float = Field(description="95% Confidence Interval upper bound (must be a number).")
    
# Defines the expected output structure for the contradiction analysis
class ContradictionAnalysis(BaseModel):
    # Core Outputs
    consensus_summary: str = Field(description="A single paragraph summarizing the overall consensus across the studies (max 3 concise sentences).")
    contradiction_alert: str = Field(description="A clear statement if a contradiction is detected (e.g., 'Strong contradiction detected: Study A showed benefit, Study B showed harm').")
    strength_of_evidence: str = Field(description="Assessed strength of evidence (e.g., 'Moderate, due to robust evidence...').")
    
    # High-Value Outputs (New Fields)
    outcome_map_data: list[OutcomeMapData] = Field(description="Data for the Conflicting Outcome Map visualization.")
    forest_plot_data: list[ForestPlotData] = Field(description="Data structured for Forest Plot visualization.")


# --- Endpoints ---

@app.post("/api/extract", response_model=PicoOExtraction)
async def extract_trial_data(file: UploadFile = File(...)):
    if not client:
        raise HTTPException(status_code=503, detail="Gemini client not initialized. Check GEMINI_API_KEY.")
        
    if file.content_type != 'application/pdf':
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    temp_filepath = f"/tmp/{file.filename}"
    async with aiofiles.open(temp_filepath, 'wb') as out_file:
        content = await file.read()
        await out_file.write(content)

    try:
        pdf_file = client.files.upload(file=temp_filepath)
        
        # Define the extraction prompt
        extraction_prompt = (
            "You are an expert clinical evidence extractor. Analyze the uploaded PDF of a clinical trial. "
            "Identify the PICO-O elements. Output the result in the required JSON format. "
            "KEEP ALL DESCRIPTIONS TO A MAXIMUM OF TWO CONCISE SENTENCES. Focus on the primary outcome's effect and numbers (HR, P-value). "
            "The study_id should be the file name."
        )

        response = client.models.generate_content(
            model=MODEL,
            contents=[pdf_file, extraction_prompt],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=PicoOExtraction,
            ),
        )
        extracted_data = PicoOExtraction.model_validate_json(response.text)
        return extracted_data

    except Exception as e:
        print(f"Extraction Error: {e}")
        raise HTTPException(status_code=500, detail=f"LLM Extraction failed: {str(e)}")
    finally:
        if os.path.exists(temp_filepath):
            os.remove(temp_filepath)
        if 'pdf_file' in locals():
            client.files.delete(name=pdf_file.name)


@app.post("/api/contradict", response_model=ContradictionAnalysis)
async def analyze_contradiction(data: ContradictionInput):
    if not client:
        raise HTTPException(status_code=503, detail="Gemini client not initialized. Check GEMINI_API_KEY.")
    if not data.studies:
        raise HTTPException(status_code=400, detail="No study data provided for analysis.")

    # Convert the list of Pydantic objects back to a readable JSON string for the LLM
    studies_json_str = json.dumps([study.model_dump() for study in data.studies], indent=2)
    
    # FINAL FIX: Updated Contradiction Prompt with High-Value Output instructions and strict Consensus Logic
    contradiction_prompt = (
        "You are an expert systematic reviewer. Analyze the following extracted PICO-O data from ALL provided clinical trials. "
        "Identify and flag any **contradictory evidence**. Generate a clear consensus summary. "
        
        "**HIGH-VALUE OUTPUTS MUST BE COMPLETE AND ACCURATE:** "
        
        "1. **Outcome Map Data:** You MUST analyze the primary outcome of *every single study* in the input list. If the study reports a numerical result (like HR/RR) that is statistically significant (P<0.05) and favors the intervention (e.g., HR < 1.0), the 'effect_direction' MUST be 'Benefit'. If it is harmful or not significant, categorize accordingly. "
        
        "2. **Forest Plot Data:** You MUST find the quantitative data for ALL studies reporting a **Hazard Ratio (HR)** or **Relative Risk (RR)**. From the study's outcome description, extract the point estimate, the 95% Confidence Interval lower bound, and the 95% Confidence Interval upper bound. All three values must be extracted as clean Python floats. Only include studies in this array where all three numerical values are found. "
        
        "The consensus_summary MUST be only one to three concise sentences. "
        
        # --- ENFORCED CONSENSUS STATEMENT LOGIC ---
        "If a strong contradiction is detected, the consensus statement MUST clearly state that evidence is mixed/conflicting. If no contradiction is detected and multiple studies show the same result, the consensus statement MUST clearly state the consistent finding. DO NOT use generic phrases like 'requires further data inspection' or 'needs further analysis'. The statement MUST be conclusive."
        # ----------------------------------------------
        
        f"The input is a list of JSON objects representing the trials:\n\n{studies_json_str}"
    )

    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=[contradiction_prompt],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ContradictionAnalysis,
            ),
        )
        analysis_result = ContradictionAnalysis.model_validate_json(response.text)
        return analysis_result

    except Exception as e:
        print(f"Contradiction Analysis Error: {e}")
        error_detail = response.text if 'response' in locals() else str(e)
        raise HTTPException(status_code=500, detail=f"LLM Contradiction Analysis failed: {error_detail}")

# --- End of main.py ---