import React, { useState } from 'react';
import { fetchAuthSession } from '@aws-amplify/auth';
import { useNavigate } from 'react-router-dom';

const CreateWorkspaceForm = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(null); // 'success' or 'error'
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType(null);

    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();

      const response = await fetch('https://2nyk16bq5g.execute-api.us-east-2.amazonaws.com/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Workspace created! Redirecting...`);
        setMessageType('success');
        setName('');

        // Redirect after short delay
        setTimeout(() => {
          navigate(`/workspace/${data.workspaceId}`);
        }, 1500);
      } else {
        setMessage(data.message || 'Error creating workspace.');
        setMessageType('error');
      }

    } catch (err) {
      console.error('Error:', err);
      setMessage('Something went wrong.');
      setMessageType('error');
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded shadow bg-white">
      <h2 className="text-xl font-bold mb-4">Create a New Workspace</h2>
      <form onSubmit={handleCreate}>
        <input
          type="text"
          className="w-full p-2 border rounded mb-2"
          placeholder="Workspace Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Workspace'}
        </button>
      </form>

      {message && (
        <p
          className={`mt-3 text-sm ${
            messageType === 'success' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default CreateWorkspaceForm;
