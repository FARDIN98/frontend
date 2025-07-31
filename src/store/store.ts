import { configureStore } from '@reduxjs/toolkit';
import presentationReducer from './slices/presentationSlice';
import userReducer from './slices/userSlice';
import socketReducer from './slices/socketSlice';

export const store = configureStore({
  reducer: {
    presentation: presentationReducer,
    user: userReducer,
    socket: socketReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['socket/setSocket'],
        ignoredPaths: ['socket.socket'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;