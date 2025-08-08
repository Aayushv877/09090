import React, { useEffect, useState } from 'react';
import { fetchAuthSession } from '@aws-amplify/auth';
import { Link, useNavigate } from 'react-router-dom';

const MyWorkspaces = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOption, setSortOption] = useState('created-desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);


  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString();

        const response = await fetch('https://2nyk16bq5g.execute-api.us-east-2.amazonaws.com/workspaces', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setWorkspaces(data.workspaces || []);
        } else {
          setError(data.message || 'Failed to load workspaces');
        }
      } catch (err) {
        console.error(err);
        setError('Error fetching workspaces');
      }
      setLoading(false);
    };

    fetchWorkspaces();
  }, []);

  useEffect(() => {
    let filteredList = [...workspaces];

    if (searchText.trim()) {
      filteredList = filteredList.filter(ws =>
        ws.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filteredList = filteredList.filter(ws => ws.role === roleFilter);
    }

    if (startDate) {
      filteredList = filteredList.filter(ws => new Date(ws.createdAt) >= new Date(startDate));
    }
    if (endDate) {
      filteredList = filteredList.filter(ws => new Date(ws.createdAt) <= new Date(endDate));
    }

    filteredList.sort((a, b) => {
      if (sortOption === 'name-asc') return a.name.localeCompare(b.name);
      if (sortOption === 'name-desc') return b.name.localeCompare(a.name);
      if (sortOption === 'created-asc') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortOption === 'created-desc') return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

    setFiltered(filteredList);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchText, roleFilter, startDate, endDate, sortOption, workspaces]);

  const handleDelete = async (workspaceId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this workspace? This cannot be undone.');
    if (!confirmDelete) return;

    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();

      const response = await fetch(
        `https://2nyk16bq5g.execute-api.us-east-2.amazonaws.com/delete-workspaces/${workspaceId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      if (response.ok) {
        setWorkspaces(prev => prev.filter(w => w.workspaceId !== workspaceId));
        alert('Workspace deleted successfully');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete workspace');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting workspace');
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  if (loading) return <p className="text-gray-600">Loading workspaces...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded shadow p-6">
      <h2 className="text-xl font-bold mb-4">My Workspaces</h2>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="all">All Roles</option>
          <option value="owner">Owner</option>
          <option value="Admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="created-desc">Newest First</option>
          <option value="created-asc">Oldest First</option>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Workspace List */}
      <div className="flex justify-end mb-4">
  <label className="mr-2 text-sm text-gray-600">Items per page:</label>
  <select
    value={itemsPerPage}
    onChange={(e) => {
      setItemsPerPage(parseInt(e.target.value));
      setCurrentPage(1); // Reset to page 1 when page size changes
    }}
    className="border p-1 rounded text-sm"
  >
    <option value={1}>1</option>
    <option value={5}>5</option>
    <option value={10}>10</option>
    <option value={20}>20</option>
    <option value={50}>50</option>
  </select>
</div>

      {filtered.length === 0 ? (
        <p className="text-gray-500">No workspaces found with the selected filters.</p>
      ) : (
        <>
          <ul className="space-y-4 mb-4">
            {currentItems.map(ws => (
              <li key={ws.workspaceId} className="border p-4 rounded hover:bg-gray-50 transition">
                <Link to={`/workspace/${ws.workspaceId}`}>
                  <h3 className="text-lg font-semibold text-blue-600 hover:underline">{ws.name}</h3>
                </Link>
                <p className="text-sm text-gray-600">Role: {ws.role}</p>
                <p className="text-sm text-gray-600">
                  Created: {new Date(ws.createdAt).toLocaleString()}
                </p>
                {ws.role === 'owner' && (
                  <button
                    className="mt-2 text-red-600 hover:underline text-sm"
                    onClick={() => handleDelete(ws.workspaceId)}
                  >
                    Delete Workspace
                  </button>
                )}
              </li>
            ))}
          </ul>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MyWorkspaces;
