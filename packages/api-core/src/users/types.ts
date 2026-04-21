export interface UserResponse {
	ID: number;
	user_login: string;
	first_name: string;
	last_name: string;
	nice_name: string;
	display_name: string;
	description: string;
	avatar_URL: string;
	profile_URL: string;
	primary_blog: {
		ID: number;
		feed_ID: number;
		URL: string;
		title: string;
		description: string;
		avatar_URL: string | null;
	} | null;
	recommended_blogs_count?: number;
}

export type ReaderUser = Pick<
	UserResponse,
	| 'ID'
	| 'user_login'
	| 'first_name'
	| 'last_name'
	| 'nice_name'
	| 'display_name'
	| 'description'
	| 'avatar_URL'
	| 'profile_URL'
>;
