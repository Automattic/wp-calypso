export interface SiteVerticalsResponse {
	id: string;
	title: string;
}

export interface SiteVerticalsQueryParams {
	term?: string;
	limit?: number;
	skip_synonyms?: boolean;
}
