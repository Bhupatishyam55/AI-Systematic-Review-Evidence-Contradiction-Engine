// frontend/src/App.jsx (UPDATED for Dark Mode and Premium Look)
import React, { useState } from 'react';
import { extractTrialData, analyzeContradiction } from './components/analysisService';
import ResultsTable from './components/ResultsTable';
import FileUploader from './components/FileUploader'; 

function App() {
  const [files, setFiles] = useState([]);
  const [extractedData, setExtractedData] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    setFiles(Array.from(event.target.files));
    setExtractedData([]); // Reset on new file selection
    setAnalysisResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (files.length === 0) {
      setError("Please upload at least one PDF file.");
      return;
    }
    setLoading(true);
    setError(null);
    setExtractedData([]);
    setAnalysisResult(null);

    const extracted = [];
    
    // --- Step 1: Extract data from all files ---
    for (const file of files) {
      try {
        const data = await extractTrialData(file);
        extracted.push(data);
      } catch (err) {
        console.error(err.message);
        // Display a general error message, but log the specific file error
        setError(`Failed to extract data from one or more files. Check console for details.`);
      }
    }

    setExtractedData(extracted);
    
    // --- Step 2: Analyze for contradiction ---
    if (extracted.length > 1) {
      try {
        const analysis = await analyzeContradiction(extracted);
        setAnalysisResult(analysis);
      } catch (err) {
        console.error(err.message);
        setError(`Contradiction analysis failed: ${err.message}`);
      }
    } else if (extracted.length === 1) {
        // If only one study, no contradiction check needed for the MVP
        setAnalysisResult({
            consensus_summary: "Only one study uploaded. No contradiction analysis was performed.",
            contradiction_alert: "N/A - Single Study",
            strength_of_evidence: "Insufficient Comparative Data",
        });
    }

    setLoading(false);
  };

  return (
    // DARK MODE BASE: bg-gray-900 and default text is light gray
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <header className="text-center mb-12">
        {/* Title uses a subtle gradient for a cool effect */}
        <h1 className="text-6xl font-extrabold tracking-tight mb-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-indigo-400">
                AI Systematic Review & Evidence Contradiction Engine
            </span>
        </h1>
        <p className="text-xl text-gray-400 font-light">
            Automated Extraction and Evidence Contradiction Engine
        </p>
      </header>
      
      {/* Main content container with dark background and strong shadow */}
      <div className="max-w-7xl mx-auto bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
        
        {/* Input Section */}
        <section className="mb-8 border-b pb-6 border-gray-700">
            {/* Dark mode heading */}
            <h2 className="text-2xl font-semibold text-gray-200 mb-4">1. Upload Trials</h2>
            
            <FileUploader 
                files={files} 
                onFileChange={handleFileChange} 
                disabled={loading} 
            />

            {/* Analyze Button - Uses bold indigo/teal gradient for attractiveness */}
            <button
                onClick={handleAnalyze}
                disabled={loading || files.length === 0}
                className={`w-full flex items-center justify-center space-x-2 px-6 py-3 mt-4 rounded-xl font-bold text-lg transition duration-300 transform ${
                    loading || files.length === 0 
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white hover:from-teal-500 hover:to-indigo-500 active:scale-[0.98] shadow-lg shadow-indigo-500/30'
                }`}
            >
                {/* SVG Icon for Loading/Analysis */}
                {loading 
                    ? (<svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>) 
                    : (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 01-.337-1.397 4.5 4.5 0 013.75-3.75 4.5 4.5 0 011.398.336L15 9.75l2.846.813a4.5 4.5 0 011.397.337 4.5 4.5 0 01-3.75 3.75 4.5 4.5 0 01-1.398-.336L9.813 15.904zM12 21.75V12m0 0l-3.375.375M12 12l3.375.375" />
                       </svg>)
                }
                <span>{loading ? 'Analyzing Trials ' : 'Analyze & Detect Contradiction'}</span>
            </button>
        </section>

        {/* Error Message - Adjusted for Dark Mode */}
        {error && (
          <div className="mt-4 p-4 bg-red-900/50 text-red-300 rounded-xl font-medium border border-red-700 mb-6">
            <strong className="font-bold text-red-200">Error:</strong> {error}
          </div>
        )}

        {/* Results Display */}
        {extractedData.length > 0 && (
          <div className="pt-6">
            {/* Dark mode heading */}
            <h2 className="text-2xl font-semibold text-gray-200 mb-6">2. Extracted Data & Analysis</h2>
            <ResultsTable extractedData={extractedData} analysisResult={analysisResult} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;