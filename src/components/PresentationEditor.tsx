import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Presentation, Monitor, Users, ArrowLeft, Plus } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import SlidesList from './SlidesList';
import SlideEditor from './SlideEditor';
import UsersList from './UsersList';
import { apiService } from '../services/apiService';
import { socketService } from '../services/socketService';
import {
  setCurrentPresentation,
  setCurrentSlideIndex,
  setLoading,
  setError,
  setPresentMode,
} from '../store/slices/presentationSlice';
import { setUser } from '../store/slices/userSlice';
import { generateId } from '../lib/utils';
import type { RootState } from '../store/store';
import type { Slide } from '../store/slices/presentationSlice';

const PresentationEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const {
    currentPresentation,
    currentSlideIndex,
    isLoading,
    error,
    isPresentMode,
  } = useSelector((state: RootState) => state.presentation);
  
  const { nickname, role, id: userId } = useSelector((state: RootState) => state.user);
  const { isConnected } = useSelector((state: RootState) => state.socket);

  useEffect(() => {
    if (id && nickname) {
      loadPresentation();
    } else {
      navigate('/');
    }
  }, [id, nickname]);

  const loadPresentation = async () => {
    if (!id || !nickname) return;

    try {
      dispatch(setLoading(true));
      const presentation = await apiService.getPresentation(id);
      dispatch(setCurrentPresentation(presentation));
      
      // Set user role based on presentation data
      const user = presentation.users.find(u => u.nickname === nickname);
      if (user) {
        dispatch(setUser({ id: user.id, nickname, role: user.role }));
      } else {
        // New user joining
        const newUserId = generateId();
        const userRole = presentation.creatorId ? 'viewer' : 'creator';
        dispatch(setUser({ id: newUserId, nickname, role: userRole }));
      }
      
      // Join via socket
      socketService.joinPresentation(id, nickname);
    } catch (err) {
      dispatch(setError('Failed to load presentation'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleAddSlide = () => {
    if (!currentPresentation || role !== 'creator') return;

    const newSlide: Slide = {
      id: generateId(),
      title: `Slide ${currentPresentation.slides.length + 1}`,
      textBlocks: [],
      order: currentPresentation.slides.length,
    };

    socketService.addSlide(currentPresentation.id, newSlide);
  };

  const handlePresentMode = () => {
    dispatch(setPresentMode(true));
    navigate(`/presentation/${id}/present`);
  };

  const handleBackToHome = () => {
    if (currentPresentation) {
      socketService.leavePresentation(currentPresentation.id);
    }
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading presentation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </Card>
      </div>
    );
  }

  if (!currentPresentation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-gray-600 mb-4">Presentation not found</p>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </Card>
      </div>
    );
  }

  const currentSlide = currentPresentation.slides[currentSlideIndex];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={handleBackToHome}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-2">
            <Presentation className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold text-gray-900">
              {currentPresentation.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* User Role Badge */}
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            role === 'creator' ? 'bg-blue-100 text-blue-800' :
            role === 'editor' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {role?.charAt(0).toUpperCase() + role?.slice(1)}
          </div>

          {/* Present Mode Button */}
          <Button onClick={handlePresentMode}>
            <Monitor className="w-4 h-4 mr-2" />
            Present
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Slides List */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-gray-900">Slides</h2>
              {role === 'creator' && (
                <Button size="sm" onClick={handleAddSlide}>
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>
            <p className="text-sm text-gray-600">
              {currentPresentation.slides.length} slide{currentPresentation.slides.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            <SlidesList
              slides={currentPresentation.slides}
              currentSlideIndex={currentSlideIndex}
              onSlideSelect={(index) => dispatch(setCurrentSlideIndex(index))}
              canEdit={role === 'creator'}
              presentationId={currentPresentation.id}
            />
          </div>
        </div>

        {/* Center Panel - Slide Editor */}
        <div className="flex-1 flex flex-col">
          {currentSlide ? (
            <SlideEditor
              slide={currentSlide}
              presentationId={currentPresentation.id}
              canEdit={role === 'editor' || role === 'creator'}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white">
              <div className="text-center">
                <p className="text-gray-600 mb-4">No slides available</p>
                {role === 'creator' && (
                  <Button onClick={handleAddSlide}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Slide
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Users List */}
        <div className="w-64 bg-white border-l border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-4 h-4 text-gray-600" />
              <h2 className="font-semibold text-gray-900">Users</h2>
            </div>
            <p className="text-sm text-gray-600">
              {currentPresentation.users.filter(u => u.isOnline).length} online
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            <UsersList
              users={currentPresentation.users}
              currentUserId={userId}
              canManageRoles={role === 'creator'}
              presentationId={currentPresentation.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PresentationEditor;