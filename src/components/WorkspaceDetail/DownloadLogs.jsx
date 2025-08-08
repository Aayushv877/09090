// src/components/WorkspaceDetail/DownloadLogs.jsx
import React, { useEffect, useState } from 'react';
import axiosInstance from '../../axiosInstance';

const DownloadLogs = ({ workspaceId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axiosInstance.get(
          `https://2nyk16bq5g.execute-api.us-east-2.amazonaws.com/workspace/${workspaceId}/download-logs`
        );
        setLogs(res.data.logs || []);
      } catch (err) {
        console.error('❌ Error fetching download logs:', err);
        setError('Failed to load download logs.');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [workspaceId]);

  if (loading) return <div className="mt-4">Loading download logs...</div>;
  if (error) return <div className="mt-4 text-red-500">{error}</div>;
  if (logs.length === 0) return <div className="mt-4 text-gray-600">No download logs found.</div>;

  return (
    <div className="mt-6 border border-blue-300 p-4 rounded-md bg-blue-50">
      <h3 className="text-lg font-semibold mb-2">📥 Download Logs</h3>
      <div className="overflow-auto max-h-96">
        <table className="min-w-full text-sm table-auto">
          <thead>
            <tr className="bg-blue-100 text-left">
              <th className="p-2">File</th>
              <th className="p-2">Timestamp</th>
              <th className="p-2">User Email</th>
              <th className="p-2 text-center">Count</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index} className="border-t">
                <td className="p-2 break-all">{log.file}</td>
                <td className="p-2">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="p-2">{log.userEmail}</td>
                <td className="p-2 text-center">{log.downloadCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DownloadLogs;
