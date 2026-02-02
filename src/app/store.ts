import { configureStore } from '@reduxjs/toolkit';
import { api } from '../services';
import rtkQueryErrorLogger from './middleware/rtkQueryErrorLogger';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefault) => getDefault().concat(api.middleware).concat(rtkQueryErrorLogger),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
