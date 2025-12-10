// frontend/src/components/ResultsTable.jsx (FINAL: Integrated Forest Plot and Outcome Map Visualizations)
import React from 'react';
import ForestPlot from './ForestPlot'; 
import OutcomeMap from './OutcomeMap'; // <--- CRITICAL: Import the OutcomeMap component

// Unified Accent Color for all analysis boxes
const ACCENT_BG = 'bg-indigo-900/50';
const ACCENT_BORDER = 'border-indigo-700';

// Helper function to color the Strength text based on its value
const getStrengthTextColor = (strength) => {
    if (!strength) return 'text-gray-400';
    const lower = strength.toLowerCase();
    // Strong (Teal)
    if (lower.includes('strong')) return 'text-teal-400';
    // Moderate (Yellow/Gold)
    if (lower.includes('moderate')) return 'text-yellow-400';
    // Weak/Contradiction (Bright Pink/Red for visibility)
    if (lower.includes('weak') || lower.includes('conflicting') || lower.includes('contradiction') || lower.includes('insufficient')) return 'text-red-400';
    return 'text-indigo-300';
};

const ResultsTable = ({ extractedData, analysisResult }) => {
    const strengthAndJustification = analysisResult?.strength_of_evidence || "Analyzing...";
    const [strengthText, ...justificationParts] = strengthAndJustification.split(', due to');
    const justification = justificationParts.length > 0 ? justificationParts.join(', due to').trim() : "Summary justification not available.";
    
    // Safely get the new high-value data for display
    const outcomeMapRawData = analysisResult?.outcome_map_data; // <-- Renamed variable for clarity
    const forestPlotRawData = analysisResult?.forest_plot_data; 

    // Raw JSON data for reference/debugging (optional, but good for regulatory inspection)
    const rawOutcomeMapJSON = JSON.stringify(outcomeMapRawData || [], null, 2);

    return (
        <div className="space-y-6">
            
            {/* 1. DEDICATED STRENGTH OF EVIDENCE PANEL */}
            <div className={`p-5 rounded-xl shadow-2xl text-center border-2 mx-auto max-w-lg transition-all ${ACCENT_BG} ${ACCENT_BORDER}`}>
                <span className="text-sm font-semibold uppercase tracking-widest text-indigo-300">
                    Current Overall Evidence Strength
                </span>
                <p className="4xl font-extrabold mt-1">
                    <span className={getStrengthTextColor(strengthText.trim())}>
                        {strengthText.trim()}
                    </span>
                </p>
                
                <p className="mt-3 text-sm italic text-gray-400 border-t border-indigo-600 pt-2">
                    <strong className="font-semibold text-gray-300">Justification:</strong> {justification}
                </p>
            </div>
            
            {/* 2. Contradiction Analysis */}
            <div className={`p-4 border-2 rounded-xl shadow-lg transition-all ${ACCENT_BG} ${ACCENT_BORDER}`}>
                <h3 className="text-xl font-bold flex items-center space-x-3 mb-2 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-yellow-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.022 3.377 1.77 3.377h14.464c1.748 0 2.636-1.877 1.77-3.377L13.565 7.15c-.56-1.077-2.03-1.077-2.59 0l-7.237 13.56c-.56 1.077-.07 2.373.99 2.373h14.464c1.748 0 2.636-1.877 1.77-3.377L13.565 7.15c-.56-1.077-2.03-1.077-2.59 0l-7.237 13.56z" />
                    </svg>
                    <span className="text-gray-100">Contradiction & Risk Analysis</span>
                </h3>
                
                <p className="text-base text-gray-300 mb-4 font-normal leading-relaxed">
                    {analysisResult?.consensus_summary || "Analyzing consensus..."}
                </p>
                
                <div className="pt-3 border-t border-dashed border-gray-600 space-y-3">
                    
                    <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase text-teal-400">Risk of Bias alert:</span>
                        <span className="text-base font-extrabold text-white tracking-wide">
                            {analysisResult?.contradiction_alert || "..."}
                        </span>
                    </div>
                    
                    <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase text-indigo-300">Consensus Statement:</span>
                        <span className="text-base font-extrabold text-gray-200 tracking-wide">
                            {analysisResult?.contradiction_alert.includes("N/A") ? "No conflict detected in the primary outcomes." : "Conflict analysis requires further data inspection."}
                        </span>
                    </div>
                </div>
            </div>
            
            {/* 3. PICO-O Extracted Data Table (Consensus Table) */}
            <h3 className="text-xl font-bold text-gray-200">Consensus table</h3>
            <div className="overflow-x-auto rounded-xl border border-gray-700 shadow-xl">
                <table className="min-w-full divide-y divide-gray-700 table-fixed">
                    <thead className="bg-gray-700">
                        <tr>
                            {['Study ID', 'Population (P)', 'Intervention (I)', 'Comparator (C)', 'Outcome (O)'].map(header => (
                                <th key={header} className="w-1/5 px-3 py-3 text-left text-xs font-bold text-teal-400 uppercase tracking-wider">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {extractedData.map((data, index) => (
                            <tr 
                                key={data.study_id || index} 
                                className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700/50 hover:bg-gray-700 transition-colors cursor-pointer'}
                            >
                                <td className="w-1/5 px-3 py-3 text-xs font-semibold text-white align-top border-r border-gray-700">{data.study_id}</td>
                                <td className="w-1/5 px-3 py-3 text-xs text-gray-300 align-top">{data.population}</td>
                                <td className="w-1/5 px-3 py-3 text-xs text-gray-300 align-top">{data.intervention}</td>
                                <td className="w-1/5 px-3 py-3 text-xs text-gray-300 align-top">{data.comparator}</td>
                                <td className="w-1/5 px-3 py-3 text-xs text-gray-300 align-top">{data.outcome}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* 🌟 4. HIGH-VALUE OUTPUT DATA SECTIONS 🌟 */}
            <h3 className="text-xl font-bold text-gray-200 pt-8 border-t border-gray-700 mt-10">
                High-Value Output Data (Regulatory Interpretation-Ready)
            </h3>
            
            {/* Forest Plot Visualization (Integrated) */}
            <div className="space-y-4">
                <ForestPlot data={forestPlotRawData} />
            </div>

            {/* Conflicting Outcome Map Visualization (REPLACED JSON WITH VISUAL COMPONENT) */}
            <div className="space-y-4">
                <OutcomeMap data={outcomeMapRawData} />
            </div>
            
        </div>
    );
};

export default ResultsTable;