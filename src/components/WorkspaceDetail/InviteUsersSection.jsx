// WorkspaceDetail/InviteUsersSection.jsx
import React from 'react';

const InviteUsersSection = ({ onClick, inviteMessage }) => (
  <div className="mb-6">
    <button
      onClick={onClick}
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
    >
      Invite User
    </button>
    {inviteMessage && <p className="text-sm mt-2">{inviteMessage}</p>}
  </div>
);

export default InviteUsersSection;
