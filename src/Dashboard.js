// src/Dashboard.js
import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '@aws-amplify/auth';

const Dashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch {
        // User should already be redirected to login via App.js if not authenticated
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Welcome{user?.username ? `, ${user.username}` : ''}.
      </h2>
      <h3 className="text-lg font-bold mb-2">Dashboard</h3>
      <p className="text-gray-700">You can now manage your files and workspaces here.</p>
    </div>
  );
};

export default Dashboard;
