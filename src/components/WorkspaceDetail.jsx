// src/components/WorkspaceDetail.jsx
import React, { useState, useEffect , useRef } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import axios from 'axios';
import { fetchAuthSession } from '@aws-amplify/auth';

import WorkspaceHeader from './WorkspaceDetail/WorkspaceHeader';
import FileUploadSection from './WorkspaceDetail/FileUploadSection';
import InviteUsersSection from './WorkspaceDetail/InviteUsersSection';
import FileList from './WorkspaceDetail/FileList';
import InviteUserModal from './InviteUserModal';
import DeleteLogs from './WorkspaceDetail/DeleteLogs';
import DownloadLogs from './WorkspaceDetail/DownloadLogs';
import ManageMembersModal from './WorkspaceDetail/ManageMembersModal';

const WorkspaceDetail = () => {
  const { id: workspaceId } = useParams();

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [workspaceName, setWorkspaceName] = useState('');

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');
  const [role, setRole] = useState('');
  const [scope, setScope] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [continuationToken, setContinuationToken] = useState({ keyMarker: null, versionIdMarker: null });

  const [tagFilter, setTagFilter] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('');
  const [uploaderFilter, setUploaderFilter] = useState('');
const [startDate, setStartDate] = useState('');
const [endDate, setEndDate] = useState('');
const [sortOption, setSortOption] = useState('date-desc');

const [showDropdown, setShowDropdown] = useState(false);
const [showDeleteLogs, setShowDeleteLogs] = useState(false);
const [showDownloadLogs, setShowDownloadLogs] = useState(false);
const dropdownRef = useRef(null);
const [showManageMembers, setShowManageMembers] = useState(false);


  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setMessage('');
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setMessage('');

    try {
      const tags = tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const contentType = selectedFile.type || "application/octet-stream";

const res = await axiosInstance.post(
  'https://2nyk16bq5g.execute-api.us-east-2.amazonaws.com/generate-upload-url',
  {
    workspaceId,
    fileName: selectedFile.name,
    contentType,
  }
);

      const { uploadUrl, objectKey } = res.data;

      if (!uploadUrl || !objectKey) throw new Error("Missing uploadUrl or objectKey");

      await axios.put(uploadUrl, selectedFile, {
        headers: { 'Content-Type': selectedFile.type },
      });

      const versionRes = await axiosInstance.get(
        `https://2nyk16bq5g.execute-api.us-east-2.amazonaws.com/get-version-id?objectKey=${encodeURIComponent(objectKey)}`
      );

      const versionId = versionRes.data.versionId;
      if (!versionId) throw new Error("Missing versionId");

      await axiosInstance.post(
  'https://2nyk16bq5g.execute-api.us-east-2.amazonaws.com/record-file-metadata',
  {
    workspaceId,
    objectKey,
    fileName: selectedFile.name,
    contentType,
    size: selectedFile.size,
    tags,
    versionId,
  }
);


      setMessage(`✅ File uploaded: ${selectedFile.name}`);
      setSelectedFile(null);
      setTagsInput('');
      fetchFiles();
    } catch (err) {
      console.error('Upload error:', err);
      setMessage(err.response?.data?.message ? `❌ Upload failed: ${err.response.data.message}` : '❌ Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleInvite = async (email, role) => {
    setInviteLoading(true);
    setInviteMessage('');

    try {
      await fetchAuthSession();

      const res = await axiosInstance.post(
        'https://2nyk16bq5g.execute-api.us-east-2.amazonaws.com/invite-user',
        {
          workspaceId,
          email,
          role,
        }
      );

      setInviteMessage(
        res.status === 200
          ? '✅ Invitation sent successfully.'
          : '❌ Failed to send invite.'
      );
    } catch (err) {
      console.error(err);
      setInviteMessage('❌ Error sending invite.');
    } finally {
      setInviteLoading(false);
      setInviteOpen(false);
    }
  };

  const fetchFiles = async (token = {}, append = false) => {
    try {
      const queryParams = new URLSearchParams({
        workspaceId,
        scope,
      });

      if (token.keyMarker && token.versionIdMarker) {
        queryParams.append('keyMarker', token.keyMarker);
        queryParams.append('versionIdMarker', token.versionIdMarker);
      }

      const url = `https://2nyk16bq5g.execute-api.us-east-2.amazonaws.com/list-files?${queryParams.toString()}`;
      const res = await axiosInstance.get(url);

      const newFiles = res.data.files || [];
      setFiles(prev => (append ? [...prev, ...newFiles] : newFiles));

      if (res.data.nextKeyMarker && res.data.nextVersionIdMarker) {
        setContinuationToken({
          keyMarker: res.data.nextKeyMarker,
          versionIdMarker: res.data.nextVersionIdMarker,
        });
        setHasMore(true);
      } else {
        setContinuationToken({ keyMarker: null, versionIdMarker: null });
        setHasMore(false);
      }
    } catch (err) {
      console.error("❌ Failed to fetch files:", err);
    }
  };

  const getOriginalFileName = (key) => {
  return key.split('/').pop(); // No slicing — just get the full filename
};


  const handleDelete = async (objectKey) => {
  if (!window.confirm('Are you sure you want to delete this file and all versions?')) return;

  try {
    await axiosInstance.post(
      'https://2nyk16bq5g.execute-api.us-east-2.amazonaws.com/delete-file',
      { workspaceId, objectKey }
    );
    alert('✅ File deleted successfully.');
    fetchFiles(); // refresh
  } catch (err) {
    console.error('❌ Failed to delete file:', err);
    alert('❌ Failed to delete file.');
  }
};


  useEffect(() => {
    const fetchWorkspaceName = async () => {
      try {
        const res = await axiosInstance.get(
          'https://2nyk16bq5g.execute-api.us-east-2.amazonaws.com/workspaces'
        );
        const allWorkspaces = res.data.workspaces || [];
        const matched = allWorkspaces.find((w) => w.workspaceId === workspaceId);
        setWorkspaceName(matched?.name || workspaceId);
      } catch (err) {
        console.error('Failed to load workspace name', err);
        setWorkspaceName(workspaceId);
      }
    };

    fetchWorkspaceName();
  }, [workspaceId]);

  useEffect(() => {
    fetchFiles(); // first page
  }, [workspaceId, scope]);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const res = await axiosInstance.get(
          `https://2nyk16bq5g.execute-api.us-east-2.amazonaws.com/user-role?workspaceId=${workspaceId}`
        );
        setRole(res.data.role);
      } catch (err) {
        console.error('❌ Failed to fetch user role', err);
        setRole('');
      }
    };

    fetchUserRole();
  }, [workspaceId]);

  useEffect(() => {
  const lowerSearch = searchText.toLowerCase();
  const lowerTag = tagFilter.toLowerCase();
  const lowerType = fileTypeFilter.toLowerCase();
  const lowerUploader = uploaderFilter.toLowerCase();

  const results = files
    .filter((file) => {
      const matchesSearch =
        file.key.toLowerCase().includes(lowerSearch) ||
        file.uploadedByEmail?.toLowerCase().includes(lowerSearch);

      const matchesTag =
        lowerTag === '' ||
        (file.tags && file.tags.some((tag) => tag.toLowerCase().includes(lowerTag)));

      const matchesType =
        lowerType === '' ||
        (file.contentType && file.contentType.toLowerCase().includes(lowerType));

      const matchesUploader =
        lowerUploader === '' ||
        (file.uploaderEmail && file.uploaderEmail.toLowerCase().includes(lowerUploader));

      const matchesDate =
        (!startDate || new Date(file.lastModified) >= new Date(startDate)) &&
        (!endDate || new Date(file.lastModified) <= new Date(endDate));

      return matchesSearch && matchesTag && matchesType && matchesUploader && matchesDate;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case 'name-asc':
          return getOriginalFileName(a.key).localeCompare(getOriginalFileName(b.key));
        case 'name-desc':
          return getOriginalFileName(b.key).localeCompare(getOriginalFileName(a.key));
        case 'date-asc':
          return new Date(a.lastModified) - new Date(b.lastModified);
        case 'date-desc':
          return new Date(b.lastModified) - new Date(a.lastModified);
        case 'size-asc':
          return a.size - b.size;
        case 'size-desc':
          return b.size - a.size;
        default:
          return 0;
      }
    });

  setFilteredFiles(results);
}, [
  searchText,
  tagFilter,
  fileTypeFilter,
  uploaderFilter,
  startDate,
  endDate,
  sortOption,
  files,
]);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, []);



  return (
    <div className="p-6 max-w-4xl mx-auto">
      <WorkspaceHeader workspaceName={workspaceName} role={role} />

      {['owner', 'Admin'].includes(role) && (
  <button
    onClick={() => setShowManageMembers(true)}
    className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
  >
    Manage Members
  </button>
)}

<ManageMembersModal
  show={showManageMembers}
  onClose={() => setShowManageMembers(false)}
  workspaceId={workspaceId}
  currentUserRole={role}
/>



      {(role === 'Admin' || role === 'owner') && (
  <div className="my-4 flex justify-between items-start">
    {/* Invite User Button (left) */}
    <InviteUsersSection
      onClick={() => setInviteOpen(true)}
      inviteMessage={inviteMessage}
    />

    {/* Logs Dropdown (right) */}
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setShowDropdown(prev => !prev)}
        className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
      >
        {showDropdown ? 'Hide Logs' : 'Show Logs'}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
          <button
            onClick={() => {
              setShowDeleteLogs(prev => !prev);
              setShowDropdown(false);
            }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            {showDeleteLogs ? 'Hide Delete Logs' : 'View Delete Logs'}
          </button>
          <button
            onClick={() => {
              setShowDownloadLogs(prev => !prev);
              setShowDropdown(false);
            }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            {showDownloadLogs ? 'Hide Download Logs' : 'View Download Logs'}
          </button>
        </div>
      )}
    </div>
  </div>
)}



{showDeleteLogs && (
  <div className="my-4">
    <DeleteLogs workspaceId={workspaceId} />
  </div>
)}

{showDownloadLogs && (
  <div className="my-4">
    <DownloadLogs workspaceId={workspaceId} />
  </div>
)}



      {(role === 'Admin' || role === 'Editor' || role === 'owner') && (
        <FileUploadSection
          selectedFile={selectedFile}
          uploading={uploading}
          message={message}
          tagsInput={tagsInput}
          onFileChange={handleFileChange}
          onTagsChange={(e) => setTagsInput(e.target.value)}
          onUpload={handleUpload}
        />
      )}


      <InviteUserModal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvite={handleInvite}
        loading={inviteLoading}
      />

      <FileList
  files={files}
  filteredFiles={filteredFiles}
  searchText={searchText}
  setSearchText={setSearchText}
  scope={scope}
  setScope={setScope}
  getOriginalFileName={getOriginalFileName}
  hasMore={hasMore}
  loadMore={() =>
    fetchFiles(
      {
        keyMarker: continuationToken.keyMarker,
        versionIdMarker: continuationToken.versionIdMarker,
      },
      true
    )
  }
  tagFilter={tagFilter}
  setTagFilter={setTagFilter}
  fileTypeFilter={fileTypeFilter}
  setFileTypeFilter={setFileTypeFilter}
  uploaderFilter={uploaderFilter}
  setUploaderFilter={setUploaderFilter}
  startDate={startDate}
  setStartDate={setStartDate}
  endDate={endDate}
  setEndDate={setEndDate}
  sortOption={sortOption}
  setSortOption={setSortOption}
  role={role}
  handleDelete={handleDelete}
/>

    </div>
  );
};

export default WorkspaceDetail;
