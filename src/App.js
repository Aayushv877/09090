// src/App.js
import React, { useEffect, useState } from 'react';
import { getCurrentUser, signOut } from '@aws-amplify/auth';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';
import CreateWorkspaceForm from './components/CreateWorkspaceForm';
import MyWorkspaces from './components/MyWorkspaces';
import WorkspaceDetail from './components/WorkspaceDetail';
import AcceptInvite from './components/AcceptInvite';
import Layout from './components/Layout';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  return (
    <Routes>
      {!user ? (
        <Route path="*" element={<LoginPage />} />
      ) : (
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard user={user} onSignOut={signOut} />} />
          <Route path="create-workspace" element={<CreateWorkspaceForm />} />
          <Route path="my-workspaces" element={<MyWorkspaces />} />
          <Route path="workspace/:id" element={<WorkspaceDetail />} />
          <Route path="invite" element={<AcceptInvite />} />
        </Route>
      )}
    </Routes>
  );
}

export default App;
