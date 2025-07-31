import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { setUser, clearUser } from './store/slices/userSlice';
import { setSocket, clearSocket } from './store/slices/socketSlice';
import { socketService } from './services/socketService';
import Home from './components/Home';
import PresentationEditor from './components/PresentationEditor';
import PresentationViewer from './components/PresentationViewer';
import './App.css';

type AppMode = 'home' | 'editor' | 'presentation';

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentPresentationId } = useAppSelector((state) => state.user);
  const { currentPresentation, presentMode } = useAppSelector((state) => state.presentation);
  const [mode, setMode] = useState<AppMode>('home');

  useEffect(() => {
    // Initialize socket connection
    socketService.connect();
    dispatch(setSocket(socketService.getSocket()));

    return () => {
      socketService.disconnect();
      dispatch(clearSocket());
    };
  }, [dispatch]);

  useEffect(() => {
    // Update mode based on current state
    if (presentMode && currentPresentation) {
      setMode('presentation');
    } else if (currentPresentationId && currentPresentation) {
      setMode('editor');
    } else {
      setMode('home');
    }
  }, [currentPresentationId, currentPresentation, presentMode]);

  const handleBackToHome = () => {
    dispatch(clearUser());
    setMode('home');
  };

  const renderContent = () => {
    switch (mode) {
      case 'home':
        return <Home />;
      case 'editor':
        return (
          <PresentationEditor
            onBackToHome={handleBackToHome}
          />
        );
      case 'presentation':
        return (
          <PresentationViewer
            slides={currentPresentation?.slides || []}
            currentSlideIndex={currentPresentation?.currentSlideIndex || 0}
            onSlideChange={(index) => {
              if (currentPresentationId) {
                socketService.updateSlideIndex(currentPresentationId, index);
              }
            }}
            onExit={() => {
              if (currentPresentationId) {
                socketService.exitPresentMode(currentPresentationId);
              }
            }}
            presentationTitle={currentPresentation?.title || 'Untitled Presentation'}
            users={currentPresentation?.users || []}
            isPresenting={presentMode}
          />
        );
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderContent()}
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
