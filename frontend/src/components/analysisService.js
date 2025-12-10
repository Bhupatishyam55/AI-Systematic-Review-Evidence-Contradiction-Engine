// frontend/src/components/analysisService.js

const BASE_URL = 'https://ai-systematic-review-evidence.onrender.com/api'; // Must match your FastAPI URL

/**
 * Extracts PICO-O data from a single PDF file using the /api/extract endpoint.
 * @param {File} file - The PDF File object to upload.
 * @returns {Promise<object>} - The structured PICO-O data.
 */
export const extractTrialData = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${BASE_URL}/extract`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Extraction failed for ${file.name}: ${error.detail}`);
    }

    return response.json();
};

/**
 * Analyzes a list of extracted PICO-O data for contradictions and consensus.
 * @param {Array<object>} studies - List of PICO-O data objects.
 * @returns {Promise<object>} - The contradiction analysis summary.
 */
export const analyzeContradiction = async (studies) => {
    const response = await fetch(`${BASE_URL}/contradict`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studies }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Contradiction analysis failed: ${error.detail}`);
    }

    return response.json();
};