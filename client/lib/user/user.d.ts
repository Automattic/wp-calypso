import type { User } from '@automattic/api-core';

export type UserMetaData = User[ 'meta' ];

// Returned by the `/me` endpoint
export type UserData = User;
