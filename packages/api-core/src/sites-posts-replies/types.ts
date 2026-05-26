import type { SiteComment } from '../sites-comments';

export interface SitePostRepliesQueryParams {
	siteId: number;
	postId: number;
	status?: string;
	order?: 'ASC' | 'DESC';
	number?: number;
	before?: string;
	after?: string;
	offset?: number;
}

export interface SitePostRepliesResponse {
	comments: SiteComment[];
	found?: number;
}

export interface CreateSitePostReplyParams {
	siteId: number;
	postId: number;
	content: string;
}
