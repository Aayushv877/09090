import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { fetchAuthSession } from '@aws-amplify/auth';

const roles = ['owner', 'Admin', 'Editor', 'Viewer'];

function canChangeRole(currentRole, targetRole) {
  if (currentRole === 'owner') return true;
  if (currentRole === 'Admin') {
    return ['Editor', 'Viewer'].includes(targetRole);
  }
  return false;
}

function getAllowedRoles(currentRole, targetRole) {
  if (currentRole === 'owner') return roles;
  if (currentRole === 'Admin' && ['Editor', 'Viewer'].includes(targetRole)) {
    return ['Admin', 'Editor', 'Viewer'];
  }
  return [];
}

async function getIdToken() {
  const session = await fetchAuthSession();
  return session.tokens?.idToken?.toString();
}

function ManageMembersModal({ show, onClose, workspaceId, currentUserRole }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) fetchMembers();
  }, [show]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const token = await getIdToken();
      const res = await axios.get(
        `https://2nyk16bq5g.execute-api.us-east-2.amazonaws.com/workspace/${workspaceId}/members`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMembers(res.data.members || []);
    } catch (err) {
      console.error('❌ Failed to load members', err);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId, newRole) => {
    try {
      const token = await getIdToken();
      await axios.post(
        `https://2nyk16bq5g.execute-api.us-east-2.amazonaws.com/workspace/${workspaceId}/update-member-role`,
        { targetUserId: userId, newRole },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchMembers();
    } catch (err) {
      console.error('❌ Failed to update role', err);
      alert('Failed to update role.');
    }
  };

  const removeUser = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this user?')) return;

    try {
      const token = await getIdToken();
      await axios.post(
        `https://2nyk16bq5g.execute-api.us-east-2.amazonaws.com/workspace/${workspaceId}/update-member-role`,
        { targetUserId: userId, newRole: 'remove' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchMembers();
    } catch (err) {
      console.error('❌ Failed to remove user', err);
      alert('Failed to remove user.');
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded p-6 w-full max-w-2xl shadow-lg max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Manage Members</h2>

        {loading ? (
          <p>Loading members...</p>
        ) : (
          <table className="w-full text-left border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Email</th>
                <th className="p-2">Current Role</th>
                <th className="p-2">Change Role</th>
                <th className="p-2">Remove</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.userId} className="border-t">
                  <td className="p-2">{member.email}</td>
                  <td className="p-2">{member.role}</td>
                  <td className="p-2">
                    {canChangeRole(currentUserRole, member.role) ? (
                      <select
                        value={member.role}
                        onChange={(e) => updateRole(member.userId, e.target.value)}
                        className="border px-2 py-1"
                      >
                        {getAllowedRoles(currentUserRole, member.role).map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="p-2">
                    {canChangeRole(currentUserRole, member.role) ? (
                      <button
                        onClick={() => removeUser(member.userId)}
                        className="text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="text-right mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 text-white rounded">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManageMembersModal;
