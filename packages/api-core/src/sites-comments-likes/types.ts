export interface SiteCommentLikeMutationParams {
	siteId: number;
	commentId: number | string;
}

export interface SiteCommentLikeMutationResponse {
	likeCount: number;
}

export interface RawSiteCommentLikeMutationResponse {
	success?: boolean;
	like_count?: number | string;
}
