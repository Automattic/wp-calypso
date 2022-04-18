export interface SiteVerticalsResponse {
	id: string;
	name: string;
	title: string;
}

export interface SiteVerticalQueryByIdParams {
	id?: string;
}

export interface SiteVerticalsQueryParams {
	term?: string;
	limit?: number;
	skip_synonyms?: boolean;
}
