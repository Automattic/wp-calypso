export interface SiteCommentAuthor {
	ID?: number;
	name?: string;
	avatar_URL?: string;
	wpcom_login?: string;
	[ key: string ]: unknown;
}

export interface SiteComment {
	ID: number | string;
	author?: SiteCommentAuthor;
	content: string;
	date?: string;
	i_like?: boolean;
	like_count?: number;
	parent?: false | { ID: number | string; [ key: string ]: unknown };
	post?: { ID: number; [ key: string ]: unknown };
	status?: string;
	type?: string;
	URL?: string;
	[ key: string ]: unknown;
}

export interface SiteCommentQueryParams {
	siteId: number;
	commentId: number | string;
}
