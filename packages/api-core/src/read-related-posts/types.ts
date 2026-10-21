export const SCOPE_ALL = 'all';
export const SCOPE_SAME = 'same';
export const SCOPE_OTHER = 'other';

export type ReadRelatedPostsScope = typeof SCOPE_ALL | typeof SCOPE_SAME | typeof SCOPE_OTHER;

export interface ReadRelatedPost {
	ID: number;
	site_ID: number;
	global_ID: string;
	[ key: string ]: unknown;
}

export interface ReadRelatedPostsResponse {
	posts: ReadRelatedPost[];
}

export interface ReadRelatedPostsParams {
	siteId: number;
	postId: number;
	scope?: ReadRelatedPostsScope;
	size?: number;
	contentWidth?: number;
}
