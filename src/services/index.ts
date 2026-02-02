import { baseQueryWithReauth } from '@/app/middleware/baseQueryWithReauth';
import { createApi } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [],
  endpoints: () => ({}), // All the api endpoints are provided by injectEndpoints
});
