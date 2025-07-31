import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronLeft, ChevronRight, X, Users, Clock } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import type { Slide, User } from '../store/slices/presentationSlice';

interface PresentationViewerProps {
  slides: Slide[];
  currentSlideIndex: number;
  onSlideChange: (index: number) => void;
  onExit: () => void;
  presentationTitle: string;
  users: User[];
  isPresenting: boolean;
}

const PresentationViewer: React.FC<PresentationViewerProps> = ({
  slides,
  currentSlideIndex,
  onSlideChange,
  onExit,
  presentationTitle,
  users,
  isPresenting,
}) => {
  const [showControls, setShowControls] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const currentSlide = slides[currentSlideIndex];

  // Auto-hide controls after inactivity
  useEffect(() => {
    const handleActivity = () => {
      setLastActivity(Date.now());
      setShowControls(true);
    };

    const hideControlsTimer = setInterval(() => {
      if (Date.now() - lastActivity > 3000) {
        setShowControls(false);
      }
    }, 1000);

    document.addEventListener('mousemove', handleActivity);
    document.addEventListener('keydown', handleActivity);
    document.addEventListener('click', handleActivity);

    return () => {
      clearInterval(hideControlsTimer);
      document.removeEventListener('mousemove', handleActivity);
      document.removeEventListener('keydown', handleActivity);
      document.removeEventListener('click', handleActivity);
    };
  }, [lastActivity]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          if (currentSlideIndex > 0) {
            onSlideChange(currentSlideIndex - 1);
          }
          break;
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
          e.preventDefault();
          if (currentSlideIndex < slides.length - 1) {
            onSlideChange(currentSlideIndex + 1);
          }
          break;
        case 'Home':
          e.preventDefault();
          onSlideChange(0);
          break;
        case 'End':
          e.preventDefault();
          onSlideChange(slides.length - 1);
          break;
        case 'Escape':
          e.preventDefault();
          onExit();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, slides.length, onSlideChange, onExit]);

  const goToPrevSlide = () => {
    if (currentSlideIndex > 0) {
      onSlideChange(currentSlideIndex - 1);
    }
  };

  const goToNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      onSlideChange(currentSlideIndex + 1);
    }
  };

  if (!currentSlide) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">No slides available</h2>
          <Button onClick={onExit} variant="outline">
            Exit Presentation
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden">
      {/* Main Slide Content */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="w-full h-full max-w-6xl max-h-4xl bg-white rounded-lg shadow-2xl relative overflow-hidden">
          {/* Slide Canvas */}
          <div className="relative w-full h-full">
            {currentSlide.textBlocks.map((textBlock) => (
              <div
                key={textBlock.id}
                className="absolute"
                style={{
                  left: `${(textBlock.x / 800) * 100}%`,
                  top: `${(textBlock.y / 600) * 100}%`,
                  width: `${(textBlock.width / 800) * 100}%`,
                  height: `${(textBlock.height / 600) * 100}%`,
                  fontSize: `${textBlock.fontSize * 1.5}px`,
                  fontWeight: textBlock.fontWeight,
                  color: textBlock.color,
                }}
              >
                <div className="w-full h-full overflow-hidden flex items-center">
                  {textBlock.content ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      className="prose prose-lg max-w-none"
                    >
                      {textBlock.content}
                    </ReactMarkdown>
                  ) : (
                    <div className="text-gray-400 italic">
                      Empty text block
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Empty Slide */}
            {currentSlide.textBlocks.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <h2 className="text-4xl font-bold mb-4">{currentSlide.title}</h2>
                  <p className="text-xl">This slide is empty</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className={cn(
        'absolute inset-x-0 bottom-0 transition-all duration-300',
        showControls ? 'translate-y-0' : 'translate-y-full'
      )}>
        <div className="bg-black/80 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            {/* Left: Presentation Info */}
            <div className="flex items-center space-x-4">
              <div>
                <h3 className="font-semibold">{presentationTitle}</h3>
                <p className="text-sm text-gray-300">
                  Slide {currentSlideIndex + 1} of {slides.length}
                </p>
              </div>
              
              {isPresenting && (
                <div className="flex items-center space-x-2 text-sm text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>Presenting</span>
                </div>
              )}
            </div>

            {/* Center: Navigation */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPrevSlide}
                disabled={currentSlideIndex === 0}
                className="text-white hover:bg-white/20"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center space-x-1">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => onSlideChange(index)}
                    className={cn(
                      'w-2 h-2 rounded-full transition-all',
                      index === currentSlideIndex
                        ? 'bg-white'
                        : 'bg-white/40 hover:bg-white/60'
                    )}
                  />
                ))}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNextSlide}
                disabled={currentSlideIndex === slides.length - 1}
                className="text-white hover:bg-white/20"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Right: Users and Exit */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <Users className="w-4 h-4" />
                <span>{users.length}</span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onExit}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Navigation Hints */}
      {showControls && (
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 text-sm">
          <div className="space-y-1">
            <div>← → Navigate slides</div>
            <div>Space Next slide</div>
            <div>Esc Exit presentation</div>
          </div>
        </div>
      )}

      {/* Click areas for navigation */}
      <div className="absolute inset-y-0 left-0 w-1/4 cursor-pointer" onClick={goToPrevSlide} />
      <div className="absolute inset-y-0 right-0 w-1/4 cursor-pointer" onClick={goToNextSlide} />
    </div>
  );
};

export default PresentationViewer;