import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  id: string | null;
  nickname: string | null;
  role: 'creator' | 'editor' | 'viewer' | null;
  currentPresentationId: string | null;
}

const initialState: UserState = {
  id: null,
  nickname: null,
  role: null,
  currentPresentationId: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ id: string; nickname: string; role: 'creator' | 'editor' | 'viewer' }>) => {
      state.id = action.payload.id;
      state.nickname = action.payload.nickname;
      state.role = action.payload.role;
    },
    setNickname: (state, action: PayloadAction<string>) => {
      state.nickname = action.payload;
    },
    setRole: (state, action: PayloadAction<'creator' | 'editor' | 'viewer'>) => {
      state.role = action.payload;
    },
    setCurrentPresentationId: (state, action: PayloadAction<string | null>) => {
      state.currentPresentationId = action.payload;
    },
    clearUser: (state) => {
      state.id = null;
      state.nickname = null;
      state.role = null;
      state.currentPresentationId = null;
    },
  },
});

export const {
  setUser,
  setNickname,
  setRole,
  setCurrentPresentationId,
  clearUser,
} = userSlice.actions;

export default userSlice.reducer;