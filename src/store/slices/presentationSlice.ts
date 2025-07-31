import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TextBlock {
  id: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontWeight: string;
  color: string;
}

export interface Slide {
  id: string;
  title: string;
  textBlocks: TextBlock[];
  order: number;
}

export interface User {
  id: string;
  nickname: string;
  role: 'creator' | 'editor' | 'viewer';
  isOnline: boolean;
}

export interface Presentation {
  id: string;
  title: string;
  slides: Slide[];
  users: User[];
  creatorId: string;
  createdAt: string;
}

interface PresentationState {
  presentations: Presentation[];
  currentPresentation: Presentation | null;
  currentSlideIndex: number;
  isLoading: boolean;
  error: string | null;
  isPresentMode: boolean;
}

const initialState: PresentationState = {
  presentations: [],
  currentPresentation: null,
  currentSlideIndex: 0,
  isLoading: false,
  error: null,
  isPresentMode: false,
};

const presentationSlice = createSlice({
  name: 'presentation',
  initialState,
  reducers: {
    setPresentations: (state, action: PayloadAction<Presentation[]>) => {
      state.presentations = action.payload;
    },
    setCurrentPresentation: (state, action: PayloadAction<Presentation>) => {
      state.currentPresentation = action.payload;
    },
    setCurrentSlideIndex: (state, action: PayloadAction<number>) => {
      state.currentSlideIndex = action.payload;
    },
    addSlide: (state, action: PayloadAction<Slide>) => {
      if (state.currentPresentation) {
        state.currentPresentation.slides.push(action.payload);
      }
    },
    removeSlide: (state, action: PayloadAction<string>) => {
      if (state.currentPresentation) {
        state.currentPresentation.slides = state.currentPresentation.slides.filter(
          slide => slide.id !== action.payload
        );
      }
    },
    updateSlide: (state, action: PayloadAction<Slide>) => {
      if (state.currentPresentation) {
        const index = state.currentPresentation.slides.findIndex(
          slide => slide.id === action.payload.id
        );
        if (index !== -1) {
          state.currentPresentation.slides[index] = action.payload;
        }
      }
    },
    addTextBlock: (state, action: PayloadAction<{ slideId: string; textBlock: TextBlock }>) => {
      if (state.currentPresentation) {
        const slide = state.currentPresentation.slides.find(
          slide => slide.id === action.payload.slideId
        );
        if (slide) {
          slide.textBlocks.push(action.payload.textBlock);
        }
      }
    },
    updateTextBlock: (state, action: PayloadAction<{ slideId: string; textBlock: TextBlock }>) => {
      if (state.currentPresentation) {
        const slide = state.currentPresentation.slides.find(
          slide => slide.id === action.payload.slideId
        );
        if (slide) {
          const index = slide.textBlocks.findIndex(
            block => block.id === action.payload.textBlock.id
          );
          if (index !== -1) {
            slide.textBlocks[index] = action.payload.textBlock;
          }
        }
      }
    },
    removeTextBlock: (state, action: PayloadAction<{ slideId: string; textBlockId: string }>) => {
      if (state.currentPresentation) {
        const slide = state.currentPresentation.slides.find(
          slide => slide.id === action.payload.slideId
        );
        if (slide) {
          slide.textBlocks = slide.textBlocks.filter(
            block => block.id !== action.payload.textBlockId
          );
        }
      }
    },
    updateUsers: (state, action: PayloadAction<User[]>) => {
      if (state.currentPresentation) {
        state.currentPresentation.users = action.payload;
      }
    },
    updateUserRole: (state, action: PayloadAction<{ userId: string; role: 'editor' | 'viewer' }>) => {
      if (state.currentPresentation) {
        const user = state.currentPresentation.users.find(
          user => user.id === action.payload.userId
        );
        if (user) {
          user.role = action.payload.role;
        }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setPresentMode: (state, action: PayloadAction<boolean>) => {
      state.isPresentMode = action.payload;
    },
  },
});

export const {
  setPresentations,
  setCurrentPresentation,
  setCurrentSlideIndex,
  addSlide,
  removeSlide,
  updateSlide,
  addTextBlock,
  updateTextBlock,
  removeTextBlock,
  updateUsers,
  updateUserRole,
  setLoading,
  setError,
  setPresentMode,
} = presentationSlice.actions;

export default presentationSlice.reducer;