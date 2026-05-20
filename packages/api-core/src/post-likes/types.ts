export interface PostLiker {
	ID: number;
	login?: string;
	name?: string;
	[ key: string ]: unknown;
}

export interface PostLikesResponse {
	found: number;
	iLike: boolean;
	likes: PostLiker[];
}

export interface RawPostLikesResponse {
	found?: number | string;
	i_like?: boolean;
	likes?: PostLiker[];
}

export interface PostLikeMutationParams {
	siteId: number;
	postId: number;
	source?: string;
}

export interface PostLikeMutationResponse {
	likeCount: number;
	liker?: PostLiker;
}

export interface RawPostLikeMutationResponse {
	success?: boolean;
	like_count?: number | string;
	liker?: PostLiker;
}
