// frontend/src/components/OutcomeMap.jsx
import React from 'react';

// Function to map the effect string to Tailwind CSS classes
const getEffectStyles = (effect) => {
    const lowerEffect = effect.toLowerCase();
    if (lowerEffect.includes('benefit')) {
        return { 
            bg: 'bg-teal-700/50 border-teal-500', 
            text: 'text-teal-300', 
            icon: '↑' 
        };
    }
    if (lowerEffect.includes('harm')) {
        return { 
            bg: 'bg-red-900/50 border-red-700', 
            text: 'text-red-300', 
            icon: '↓' 
        };
    }
    // Neutral or No Effect
    return { 
        bg: 'bg-gray-700/50 border-gray-600', 
        text: 'text-gray-400', 
        icon: '—' 
    };
};

const OutcomeMap = ({ data }) => {
    if (!data || data.length === 0) {
        return <p className="text-gray-400 p-4 text-center">Outcome Map data is missing. Please ensure multiple studies were processed.</p>;
    }

    return (
        <div className="p-4 bg-gray-800 rounded-xl border border-gray-700">
            <h4 className="text-xl font-semibold text-teal-400 mb-4">Conflicting Outcome Map Visualization</h4>
            
            {/* Grid layout to display the cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.map((item, index) => {
                    const styles = getEffectStyles(item.effect_direction);
                    return (
                        <div 
                            key={index}
                            className={`p-4 rounded-lg shadow-lg border-2 ${styles.bg} transition-transform hover:scale-[1.02]`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-bold uppercase text-gray-200">
                                    {item.outcome_label.length > 30 ? item.outcome_label.substring(0, 30) + '...' : item.outcome_label}
                                </span>
                                <span className={`text-3xl font-extrabold ${styles.text} ml-2`}>
                                    {styles.icon}
                                </span>
                            </div>
                            <p className="text-xs font-medium text-indigo-300">
                                {item.study_id}
                            </p>
                            <p className={`text-base font-extrabold ${styles.text} mt-2`}>
                                {item.effect_direction}
                            </p>
                        </div>
                    );
                })}
            </div>
            <p className="text-xs text-gray-500 mt-4 italic">
                Each card represents a study's primary outcome, color-coded by the intervention's net effect.
            </p>
        </div>
    );
};

export default OutcomeMap;