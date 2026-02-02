import { fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
// import { setCredentials, loggedOut } from '@app/authSlice';
import { Mutex } from 'async-mutex';
import Cookie from 'js-cookie';

const mutex = new Mutex();

const rawBaseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:9999/',
  prepareHeaders: (headers, { getState }) => {
    const token = Cookie.get('access_token');

    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    // TODO: add logic for FromData
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    headers.set('Accept', '*/*');

    return headers;
  },
});

// wrap raw base query with retry
const baseQuery = retry(rawBaseQuery, { maxRetries: 1 });

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();

  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    // prevent parallel refreshes
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshToken = Cookie.get('refresh_token');

        const refreshResult = await rawBaseQuery(
          {
            url: '/auth/refresh',
            method: 'POST',
            body: { refreshToken },
          },
          api,
          extraOptions,
        );

        if (refreshResult.data) {
          const data = refreshResult.data as { access_token: string; refresh_token: string };

          Cookie.set('access_token', data.access_token);
          Cookie.set('refresh_token', data.refresh_token);

          // api.dispatch(setCredentials(data));

          // retry original request
          result = await rawBaseQuery(args, api, extraOptions);
        } else {
          await rawBaseQuery(
            {
              url: '/auth/logout',
              method: 'POST',
              body: refreshToken ? { refreshToken } : {},
            },
            api,
            extraOptions,
          );

          Cookie.remove('access_token');
          Cookie.remove('refresh_token');

          // api.dispatch(loggedOut());
          // TODO: fix this to reset the state correctly
          // api.dispatch(api.util.resetApiState());
        }
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await rawBaseQuery(args, api, extraOptions);
    }
  }

  return result;
};
