import React from 'react';
import { Trash2, FileText } from 'lucide-react';
import { Button } from './ui/Button';
import { socketService } from '../services/socketService';
import { cn } from '../lib/utils';
import type { Slide } from '../store/slices/presentationSlice';

interface SlidesListProps {
  slides: Slide[];
  currentSlideIndex: number;
  onSlideSelect: (index: number) => void;
  canEdit: boolean;
  presentationId: string;
}

const SlidesList: React.FC<SlidesListProps> = ({
  slides,
  currentSlideIndex,
  onSlideSelect,
  canEdit,
  presentationId,
}) => {
  const handleDeleteSlide = (slideId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (slides.length <= 1) {
      alert('Cannot delete the last slide');
      return;
    }
    
    if (confirm('Are you sure you want to delete this slide?')) {
      socketService.removeSlide(presentationId, slideId);
    }
  };

  return (
    <div className="p-2 space-y-2">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            'relative group cursor-pointer rounded-lg border-2 transition-all',
            currentSlideIndex === index
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          )}
          onClick={() => onSlideSelect(index)}
        >
          {/* Slide Thumbnail */}
          <div className="aspect-video p-3">
            <div className="w-full h-full bg-white rounded border border-gray-100 relative overflow-hidden">
              {/* Slide Preview */}
              <div className="absolute inset-2">
                {slide.textBlocks.length > 0 ? (
                  <div className="space-y-1">
                    {slide.textBlocks.slice(0, 3).map((block, blockIndex) => (
                      <div
                        key={block.id}
                        className="text-xs text-gray-600 truncate"
                        style={{
                          fontSize: Math.max(6, block.fontSize * 0.3),
                          fontWeight: block.fontWeight,
                        }}
                      >
                        {block.content || 'Empty text block'}
                      </div>
                    ))}
                    {slide.textBlocks.length > 3 && (
                      <div className="text-xs text-gray-400">...</div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FileText className="w-6 h-6 text-gray-300" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Slide Info */}
          <div className="px-3 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {slide.title}
                </p>
                <p className="text-xs text-gray-500">
                  {slide.textBlocks.length} text block{slide.textBlocks.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              {canEdit && slides.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                  onClick={(e) => handleDeleteSlide(slide.id, e)}
                >
                  <Trash2 className="w-3 h-3 text-red-500" />
                </Button>
              )}
            </div>
          </div>

          {/* Slide Number Badge */}
          <div className="absolute top-2 left-2 bg-gray-900 text-white text-xs px-1.5 py-0.5 rounded">
            {index + 1}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SlidesList;