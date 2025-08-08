import React from 'react';
import FileVersions from '../FileVersions';

const FileList = ({
  files,
  filteredFiles,
  searchText,
  setSearchText,
  scope,
  setScope,
  tagFilter,
  setTagFilter,
  sortOption,
  setSortOption,
  uploaderFilter,
  setUploaderFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  getOriginalFileName,
  hasMore,
  loadMore,
  role,
  handleDelete,
}) => {
  const visibleFiles = searchText || tagFilter || uploaderFilter || startDate || endDate ? filteredFiles : files;

  const uniqueUploaderEmails = [...new Set(files.map(f => f.uploaderEmail).filter(Boolean))];

  return (
    <div>
      {/* FILTER CONTROLS */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
        {/* Scope: All / Mine */}
        <div>
          <label htmlFor="scope" className="block text-sm font-medium mb-1">
            Show:
          </label>
          <select
            id="scope"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            className="w-full border rounded px-3 py-1 text-sm"
          >
            <option value="all">All Files</option>
            <option value="mine">My Files</option>
          </select>
        </div>

        {/* Search */}
        <div>
          <label className="block text-sm font-medium mb-1">Search</label>
          <input
            type="text"
            placeholder="By name..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full border px-3 py-1 text-sm rounded"
          />
        </div>

        {/* Tag Filter */}
        <div>
          <label className="block text-sm font-medium mb-1">Tag Filter</label>
          <input
            type="text"
            placeholder="e.g. invoice, final"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="w-full border px-3 py-1 text-sm rounded"
          />
        </div>

        {/* Uploader Filter */}
        <div>
          <label className="block text-sm font-medium mb-1">Uploaded By</label>
          <select
            value={uploaderFilter}
            onChange={(e) => setUploaderFilter(e.target.value)}
            className="w-full border px-3 py-1 text-sm rounded"
          >
            <option value="">All</option>
            {uniqueUploaderEmails.map((email) => (
              <option key={email} value={email}>
                {email}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border px-3 py-1 text-sm rounded"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border px-3 py-1 text-sm rounded"
          />
        </div>

        {/* Sorting */}
        <div>
          <label className="block text-sm font-medium mb-1">Sort By</label>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="w-full border px-3 py-1 text-sm rounded"
          >
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="size-asc">Size Low → High</option>
            <option value="size-desc">Size High → Low</option>
          </select>
        </div>
      </div>

      {/* FILE LIST */}
      <h3 className="text-lg font-semibold mb-2">Files</h3>
      {visibleFiles.length === 0 ? (
        <p className="text-gray-500">No files uploaded yet.</p>
      ) : (
        <ul className="space-y-2">
          {visibleFiles.map((file) => (
            <li key={file.key} className="bg-gray-100 p-2 rounded text-sm">
              <span className="font-semibold">{getOriginalFileName(file.key)}</span>
              <span className="ml-2 text-gray-600 text-xs">
                Uploaded by: {file.uploaderEmail || file.key.split('/')[1]}
              </span>
              <span className="ml-2 text-gray-600 text-xs">
                • {(file.size / 1024).toFixed(1)} KB
              </span>
              <span className="ml-2 text-gray-600 text-xs">
                • {new Date(file.lastModified).toLocaleString()}
              </span>
              {file.tags?.length > 0 && (
                <div className="mt-1 text-xs text-gray-600">
                  Tags: {file.tags.join(', ')}
                </div>
              )}
              <FileVersions objectKey={file.key} />
              {(role === 'Admin' || role === 'owner') && (
  <button
    className="mt-2 text-red-600 text-xs hover:underline"
    onClick={() => handleDelete(file.key)}
  >
    🗑️ Delete File
  </button>
)}
            </li>
          ))}
        </ul>
      )}

      {/* LOAD MORE */}
      {hasMore && (
        <button
          onClick={loadMore}
          className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Load More
        </button>
      )}
    </div>
  );
};

export default FileList;
