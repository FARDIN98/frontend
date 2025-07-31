import React, { useState, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Plus, Type, Trash2, Edit3 } from 'lucide-react';
import { Button } from './ui/Button';
import { socketService } from '../services/socketService';
import { generateId, debounce } from '../lib/utils';
import type { Slide, TextBlock } from '../store/slices/presentationSlice';

interface SlideEditorProps {
  slide: Slide;
  presentationId: string;
  canEdit: boolean;
}

const SlideEditor: React.FC<SlideEditorProps> = ({
  slide,
  presentationId,
  canEdit,
}) => {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const debouncedUpdateTextBlock = useCallback(
    debounce((textBlock: TextBlock) => {
      socketService.updateTextBlock(presentationId, slide.id, textBlock);
    }, 300),
    [presentationId, slide.id]
  );

  const handleAddTextBlock = () => {
    if (!canEdit) return;

    const newTextBlock: TextBlock = {
      id: generateId(),
      content: 'Click to edit text',
      x: 100,
      y: 100,
      width: 300,
      height: 100,
      fontSize: 16,
      fontWeight: 'normal',
      color: '#000000',
    };

    socketService.addTextBlock(presentationId, slide.id, newTextBlock);
  };

  const handleDeleteTextBlock = (textBlockId: string) => {
    if (!canEdit) return;
    
    if (confirm('Are you sure you want to delete this text block?')) {
      socketService.removeTextBlock(presentationId, slide.id, textBlockId);
    }
  };

  const handleTextBlockUpdate = (textBlock: TextBlock) => {
    if (!canEdit) return;
    debouncedUpdateTextBlock(textBlock);
  };

  const handleStartEditing = (textBlock: TextBlock) => {
    if (!canEdit) return;
    setEditingBlockId(textBlock.id);
    setEditingContent(textBlock.content);
  };

  const handleFinishEditing = () => {
    if (editingBlockId) {
      const textBlock = slide.textBlocks.find(block => block.id === editingBlockId);
      if (textBlock) {
        const updatedBlock = { ...textBlock, content: editingContent };
        socketService.updateTextBlock(presentationId, slide.id, updatedBlock);
      }
    }
    setEditingBlockId(null);
    setEditingContent('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleFinishEditing();
    } else if (e.key === 'Escape') {
      setEditingBlockId(null);
      setEditingContent('');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Slide Editor Toolbar */}
      <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="font-semibold text-gray-900">{slide.title}</h3>
          <span className="text-sm text-gray-500">
            {slide.textBlocks.length} text block{slide.textBlocks.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {canEdit && (
          <Button onClick={handleAddTextBlock} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Text
          </Button>
        )}
      </div>

      {/* Slide Canvas */}
      <div className="flex-1 relative overflow-hidden bg-gray-50">
        <div className="absolute inset-4 bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Canvas Area */}
          <div className="relative w-full h-full">
            {slide.textBlocks.map((textBlock) => (
              <Rnd
                key={textBlock.id}
                size={{ width: textBlock.width, height: textBlock.height }}
                position={{ x: textBlock.x, y: textBlock.y }}
                onDragStop={(e, d) => {
                  if (canEdit) {
                    handleTextBlockUpdate({
                      ...textBlock,
                      x: d.x,
                      y: d.y,
                    });
                  }
                }}
                onResizeStop={(e, direction, ref, delta, position) => {
                  if (canEdit) {
                    handleTextBlockUpdate({
                      ...textBlock,
                      width: ref.offsetWidth,
                      height: ref.offsetHeight,
                      x: position.x,
                      y: position.y,
                    });
                  }
                }}
                disableDragging={!canEdit}
                enableResizing={canEdit}
                className={`border-2 transition-all ${
                  selectedBlockId === textBlock.id
                    ? 'border-primary'
                    : 'border-transparent hover:border-gray-300'
                }`}
                onClick={() => setSelectedBlockId(textBlock.id)}
              >
                <div className="relative w-full h-full p-2 group">
                  {editingBlockId === textBlock.id ? (
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      onBlur={handleFinishEditing}
                      onKeyDown={handleKeyDown}
                      className="w-full h-full resize-none border-none outline-none bg-transparent"
                      style={{
                        fontSize: textBlock.fontSize,
                        fontWeight: textBlock.fontWeight,
                        color: textBlock.color,
                      }}
                      autoFocus
                    />
                  ) : (
                    <div
                      className="w-full h-full overflow-hidden cursor-pointer"
                      onClick={() => canEdit && handleStartEditing(textBlock)}
                      style={{
                        fontSize: textBlock.fontSize,
                        fontWeight: textBlock.fontWeight,
                        color: textBlock.color,
                      }}
                    >
                      {textBlock.content ? (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          className="prose prose-sm max-w-none"
                        >
                          {textBlock.content}
                        </ReactMarkdown>
                      ) : (
                        <div className="text-gray-400 italic">
                          Click to add text
                        </div>
                      )}
                    </div>
                  )}

                  {/* Text Block Controls */}
                  {canEdit && selectedBlockId === textBlock.id && (
                    <div className="absolute -top-8 right-0 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 bg-white shadow-sm"
                        onClick={() => handleStartEditing(textBlock)}
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 bg-white shadow-sm text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteTextBlock(textBlock.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </Rnd>
            ))}

            {/* Empty State */}
            {slide.textBlocks.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Type className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">This slide is empty</p>
                  {canEdit && (
                    <Button onClick={handleAddTextBlock}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Text Block
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      {canEdit && (
        <div className="border-t border-gray-200 px-4 py-2 bg-gray-50">
          <p className="text-xs text-gray-600">
            <strong>Tips:</strong> Click text blocks to select, double-click to edit. 
            Drag to move, resize from corners. Use Markdown for formatting.
          </p>
        </div>
      )}
    </div>
  );
};

export default SlideEditor;