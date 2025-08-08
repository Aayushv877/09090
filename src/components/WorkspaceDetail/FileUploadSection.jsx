// WorkspaceDetail/FileUploadSection.jsx
import React from 'react';

const FileUploadSection = ({
  selectedFile,
  uploading,
  message,
  tagsInput,
  onFileChange,
  onTagsChange,
  onUpload,
}) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold mb-2">Upload a File</h3>
    <input type="file" onChange={onFileChange} className="mb-2" />
    <input
      type="text"
      placeholder="Enter tags (comma separated)"
      value={tagsInput}
      onChange={onTagsChange}
      className="mb-2 w-full border border-gray-300 px-3 py-1 rounded text-sm"
    />
    <button
      onClick={onUpload}
      disabled={!selectedFile || uploading}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
    >
      {uploading ? 'Uploading...' : 'Upload'}
    </button>
    {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}
  </div>
);

export default FileUploadSection;
