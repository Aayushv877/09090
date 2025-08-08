// WorkspaceDetail/WorkspaceHeader.jsx
import React from 'react';

const WorkspaceHeader = ({ workspaceName, role }) => (
  <>
    <h2 className="text-2xl font-bold mb-4">Workspace: {workspaceName}</h2>
    <p className="text-sm text-gray-500 mb-4">
      Your Role: <span className="font-medium capitalize">{role}</span>
    </p>
  </>
);

export default WorkspaceHeader;
