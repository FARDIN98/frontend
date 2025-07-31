import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Calendar } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { apiService } from '../services/apiService';
import { socketService } from '../services/socketService';
import { setPresentations, setLoading, setError } from '../store/slices/presentationSlice';
import { setNickname, setCurrentPresentationId } from '../store/slices/userSlice';
import { formatDate } from '../lib/utils';
import type { RootState } from '../store/store';
import type { Presentation } from '../store/slices/presentationSlice';

const Home: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { presentations, isLoading, error } = useSelector((state: RootState) => state.presentation);
  const { nickname } = useSelector((state: RootState) => state.user);
  
  const [nicknameInput, setNicknameInput] = useState(nickname || '');
  const [newPresentationTitle, setNewPresentationTitle] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadPresentations();
    socketService.connect();
  }, []);

  const loadPresentations = async () => {
    try {
      dispatch(setLoading(true));
      const data = await apiService.getPresentations();
      dispatch(setPresentations(data));
    } catch (err) {
      dispatch(setError('Failed to load presentations'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleCreatePresentation = async () => {
    if (!nicknameInput.trim() || !newPresentationTitle.trim()) {
      alert('Please enter both nickname and presentation title');
      return;
    }

    try {
      dispatch(setLoading(true));
      const presentation = await apiService.createPresentation({
        title: newPresentationTitle,
        creatorNickname: nicknameInput,
      });
      
      dispatch(setNickname(nicknameInput));
      dispatch(setCurrentPresentationId(presentation.id));
      
      socketService.joinPresentation(presentation.id, nicknameInput);
      navigate(`/presentation/${presentation.id}`);
    } catch (err) {
      dispatch(setError('Failed to create presentation'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleJoinPresentation = (presentation: Presentation) => {
    if (!nicknameInput.trim()) {
      alert('Please enter your nickname');
      return;
    }

    dispatch(setNickname(nicknameInput));
    dispatch(setCurrentPresentationId(presentation.id));
    
    socketService.joinPresentation(presentation.id, nicknameInput);
    navigate(`/presentation/${presentation.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">CollabSlides</h1>
          <p className="text-lg text-gray-600">Real-time collaborative presentations</p>
        </div>

        {/* Nickname Input */}
        <Card className="max-w-md mx-auto mb-8">
          <CardHeader>
            <CardTitle>Enter Your Nickname</CardTitle>
            <CardDescription>
              No registration required - just enter a nickname to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="text"
              placeholder="Your nickname"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              className="mb-4"
            />
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="w-full"
              disabled={!nicknameInput.trim()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Presentation
            </Button>
          </CardContent>
        </Card>

        {/* Create Presentation Form */}
        {showCreateForm && (
          <Card className="max-w-md mx-auto mb-8">
            <CardHeader>
              <CardTitle>Create Presentation</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                placeholder="Presentation title"
                value={newPresentationTitle}
                onChange={(e) => setNewPresentationTitle(e.target.value)}
                className="mb-4"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleCreatePresentation}
                  disabled={!newPresentationTitle.trim() || isLoading}
                  className="flex-1"
                >
                  Create
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewPresentationTitle('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Presentations List */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Available Presentations</h2>
          
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading presentations...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
              <Button onClick={loadPresentations} className="mt-2">
                Try Again
              </Button>
            </div>
          )}

          {!isLoading && !error && presentations.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">No presentations available. Create the first one!</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {presentations.map((presentation) => (
              <Card key={presentation.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">{presentation.title}</CardTitle>
                  <CardDescription>
                    Created by {presentation.users.find(u => u.id === presentation.creatorId)?.nickname || 'Unknown'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {presentation.users.filter(u => u.isOnline).length} online
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(presentation.createdAt)}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleJoinPresentation(presentation)}
                    disabled={!nicknameInput.trim()}
                    className="w-full"
                  >
                    Join Presentation
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;