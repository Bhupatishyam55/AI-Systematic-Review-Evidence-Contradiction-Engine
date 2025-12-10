// frontend/src/components/FileUploader.jsx (UPDATED for Dark Mode Visibility)
import React from 'react';

const FileUploader = ({ files, onFileChange, disabled }) => {
  return (
    <div className="mb-6">
      {/* Label changed to bright gray/white */}
      <label className="block text-sm font-medium text-gray-200 mb-2">
        Upload Clinical Trial PDFs 
      </label>
      <input 
        type="file" 
        accept=".pdf" 
        multiple 
        onChange={onFileChange} 
        disabled={disabled}
        className="w-full text-sm text-gray-400
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0
                   file:text-sm file:font-semibold
                   /* Button color set to bright teal for high contrast */
                   file:bg-teal-600 file:text-white
                   hover:file:bg-teal-500 transition-colors"
      />
      {files.length > 0 && (
        <p className="mt-2 text-sm text-gray-400">
          Selected: <strong className="font-semibold text-teal-400">{files.length}</strong> file(s).
        </p>
      )}
    </div>
  );
};

export default FileUploader;