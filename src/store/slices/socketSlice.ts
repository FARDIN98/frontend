import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Socket } from 'socket.io-client';

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
}

const initialState: SocketState = {
  socket: null,
  isConnected: false,
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setSocket: (state, action: PayloadAction<Socket>) => {
      state.socket = action.payload;
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    clearSocket: (state) => {
      state.socket = null;
      state.isConnected = false;
    },
  },
});

export const {
  setSocket,
  setConnected,
  clearSocket,
} = socketSlice.actions;

export default socketSlice.reducer;