import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { fetchAuthSession } from '@aws-amplify/auth';

function DeleteLogs({ workspaceId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        // 1. Fetch session and get ID token
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString();

        if (!idToken) {
          throw new Error('Missing ID token');
        }

        // 2. Fetch logs with Authorization header
        const res = await axios.get(
          `https://2nyk16bq5g.execute-api.us-east-2.amazonaws.com/workspace/${workspaceId}/delete-logs`,
          {
            headers: {
              Authorization: idToken,
            },
          }
        );

        setLogs(res.data);
        setError('');
      } catch (err) {
        console.error('Failed to fetch delete logs', err);
        setError('Failed to load delete logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [workspaceId]);

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-2">Delete Logs</h2>

      {loading && <p>Loading logs...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && logs.length === 0 && (
        <p>No files have been deleted in this workspace.</p>
      )}

      <ul className="space-y-2">
        {logs.map((log, idx) => (
          <li key={idx} className="border p-3 rounded shadow-sm">
            <div className="font-medium">{log.objectKey.split('/').pop()}</div>
            <div className="text-sm text-gray-700">
              Deleted by <span className="font-semibold">{log.deletedByEmail}</span> <br />
              on {new Date(log.deletedAt).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  })} <br />
              {log.versionCount > 0 && `Versions deleted: ${log.versionCount}`}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DeleteLogs;
