export interface PostLiker {
	ID: number;
	avatar_URL: string;
	login: string;
	name: string;
	site_ID: number;
	site_visible: boolean;
}

export interface PostLikesResponse {
	found: number;
	iLike: boolean;
	likes: PostLiker[];
}
