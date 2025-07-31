import { io, Socket } from 'socket.io-client';
import { store } from '../store/store';
import { setSocket, setConnected } from '../store/slices/socketSlice';
import {
  setCurrentPresentation,
  updateSlide,
  addTextBlock,
  updateTextBlock,
  removeTextBlock,
  updateUsers,
  addSlide,
  removeSlide,
} from '../store/slices/presentationSlice';
import { setRole } from '../store/slices/userSlice';
import type { Presentation, Slide, TextBlock, User } from '../store/slices/presentationSlice';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    this.socket = io('http://localhost:3001');
    store.dispatch(setSocket(this.socket));

    this.socket.on('connect', () => {
      console.log('Connected to server');
      store.dispatch(setConnected(true));
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      store.dispatch(setConnected(false));
    });

    // Presentation events
    this.socket.on('presentation-updated', (presentation: Presentation) => {
      store.dispatch(setCurrentPresentation(presentation));
    });

    this.socket.on('slide-updated', (slide: Slide) => {
      store.dispatch(updateSlide(slide));
    });

    this.socket.on('slide-added', (slide: Slide) => {
      store.dispatch(addSlide(slide));
    });

    this.socket.on('slide-removed', (slideId: string) => {
      store.dispatch(removeSlide(slideId));
    });

    this.socket.on('text-block-added', (data: { slideId: string; textBlock: TextBlock }) => {
      store.dispatch(addTextBlock(data));
    });

    this.socket.on('text-block-updated', (data: { slideId: string; textBlock: TextBlock }) => {
      store.dispatch(updateTextBlock(data));
    });

    this.socket.on('text-block-removed', (data: { slideId: string; textBlockId: string }) => {
      store.dispatch(removeTextBlock(data));
    });

    this.socket.on('users-updated', (users: User[]) => {
      store.dispatch(updateUsers(users));
    });

    this.socket.on('role-updated', (data: { userId: string; role: 'editor' | 'viewer' }) => {
      const state = store.getState();
      if (state.user.id === data.userId) {
        store.dispatch(setRole(data.role));
      }
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      store.dispatch(setConnected(false));
    }
  }

  // Presentation methods
  joinPresentation(presentationId: string, nickname: string) {
    this.socket?.emit('join-presentation', { presentationId, nickname });
  }

  leavePresentation(presentationId: string) {
    this.socket?.emit('leave-presentation', { presentationId });
  }

  createPresentation(title: string, nickname: string) {
    this.socket?.emit('create-presentation', { title, nickname });
  }

  // Slide methods
  addSlide(presentationId: string, slide: Slide) {
    this.socket?.emit('add-slide', { presentationId, slide });
  }

  removeSlide(presentationId: string, slideId: string) {
    this.socket?.emit('remove-slide', { presentationId, slideId });
  }

  updateSlide(presentationId: string, slide: Slide) {
    this.socket?.emit('update-slide', { presentationId, slide });
  }

  // Text block methods
  addTextBlock(presentationId: string, slideId: string, textBlock: TextBlock) {
    this.socket?.emit('add-text-block', { presentationId, slideId, textBlock });
  }

  updateTextBlock(presentationId: string, slideId: string, textBlock: TextBlock) {
    this.socket?.emit('update-text-block', { presentationId, slideId, textBlock });
  }

  removeTextBlock(presentationId: string, slideId: string, textBlockId: string) {
    this.socket?.emit('remove-text-block', { presentationId, slideId, textBlockId });
  }

  // User role methods
  updateUserRole(presentationId: string, userId: string, role: 'editor' | 'viewer') {
    this.socket?.emit('update-user-role', { presentationId, userId, role });
  }
}

export const socketService = new SocketService();