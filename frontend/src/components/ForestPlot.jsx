// frontend/src/components/ForestPlot.jsx (UPDATED for clean Y-Axis labels)
import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ReferenceLine, Tooltip, ResponsiveContainer } from 'recharts';

// ... (rest of the component definition remains the same)

const ForestPlot = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-gray-400 p-4 text-center">Forest Plot data is missing or empty. Ensure the LLM successfully extracted HR/RR and CIs.</p>;
  }

  // Map data to include the range (CI length) and error bars
  const chartData = data.map((item, index) => ({
    study_id: item.study_id,
    index: index,
    estimate: item.effect_estimate,
    ci_range: [item.ci_lower, item.ci_upper],
    // Create a concise label for the Y-axis: Use study ID or truncate the long name
    concise_label: item.study_id.length > 20 ? item.study_id.split(' ')[0] + ' Trial' : item.study_id
  }));
  
  // Custom Y-axis tick formatter - Use the concise label
  const formatYAxis = (tickItem) => {
    const study = chartData.find(d => d.index === tickItem);
    return study ? study.concise_label : ''; // <--- Use the concise label here
  };
  
  // Custom tooltip content (remains the same)
  const CustomTooltip = ({ active, payload }) => {
    // ... (content remains the same)
    if (active && payload && payload.length) {
      const studyData = payload[0].payload;
      return (
        <div className="bg-gray-800 p-3 border border-teal-500 rounded shadow-lg text-xs text-white">
          <p className="font-bold text-teal-300">{studyData.study_id}</p>
          <p>Estimate (HR/RR): {studyData.estimate.toFixed(2)}</p>
          <p>95% CI: [{studyData.ci_range[0].toFixed(2)} to {studyData.ci_range[1].toFixed(2)}]</p>
        </div>
      );
    }
    return null;
  };


  return (
    <div className="p-4 bg-gray-800 rounded-xl border border-gray-700">
        <h4 className="text-xl font-semibold text-teal-400 mb-4">Forest Plot Summary Visualization</h4>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart
            margin={{ top: 20, right: 30, left: 100, bottom: 20 }} // <--- Increased LEFT margin for labels
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
            <XAxis 
              type="number" 
              dataKey="estimate" 
              domain={[0.5, 2]} 
              label={{ value: 'Effect Estimate (HR/RR)', position: 'bottom', fill: '#90cdf4' }}
              stroke="#cbd5e0"
            />
            <YAxis 
              type="number" 
              dataKey="index" 
              domain={[-0.5, chartData.length - 0.5]}
              tickFormatter={formatYAxis} // <--- Using the concise formatter
              width={100} // <--- Added width constraint for Y-Axis
              stroke="#cbd5e0"
            />
            
            {/* Reference Line at X=1 (Line of No Effect) */}
            <ReferenceLine x={1} stroke="#f56565" strokeDasharray="3 3" label={{ position: 'top', value: 'No Effect (1.0)', fill: '#f56565', fontSize: 12 }} />
            
            <Tooltip content={<CustomTooltip />} />
            
            {/* Scatter Plot for the Point Estimate (HR/RR) */}
            <Scatter name="Point Estimate" data={chartData} fill="#48bb78" shape="circle" isAnimationActive={false} />
            
          </ScatterChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-500 mt-4 italic">Note: The vertical position of each point represents a single study, and the horizontal position represents the effect estimate.</p>
    </div>
  );
};

export default ForestPlot;