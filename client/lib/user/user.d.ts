import type { User } from '@automattic/api-core';

export type UserMetaData = User[ 'meta' ];

// Returned by the `/me` endpoint
export type UserData = User;

// Returned by the `/users/:user` endpoint
export type UserProfileData = {
	ID: number;
	avatar_URL: string;
	first_name: string;
	last_name: string;
	description: string;
	display_name: string;
	profile_URL: string;
	user_login: string;
	primary_blog?: UserProfilePrimaryBlog | null;
	recommended_blogs_count?: number;
};

interface UserProfilePrimaryBlog {
	ID: number;
	feed_ID: number;
	URL: string;
	title: string;
	description: string;
	avatar_URL: string | null;
}
