import type { User } from '@automattic/api-core';

export type UserMetaData = User[ 'meta' ];

// Returned by the `/me` endpoint
export type UserData = User;

// Returned by the `/users/:user` endpoint
export type UserProfileData = {
	ID: number;
	avatar_URL: string;
	bio?: string;
	display_name: string;
	primary_blog?: number;
	profile_URL?: string;
	user_login: string;
};
