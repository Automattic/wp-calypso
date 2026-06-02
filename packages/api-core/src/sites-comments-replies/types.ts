export interface CreateSiteCommentReplyParams {
	siteId: number;
	content: string;
	parentCommentId: number | string;
}
