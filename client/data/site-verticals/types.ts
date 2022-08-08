export interface SiteVerticalsResponse {
	id: string;
	name: string;
	title: string;
	has_verticalizable_images?: boolean;
}

export interface SiteVerticalQueryByIdParams {
	id?: string;
}

export interface SiteVerticalsQueryParams {
	term?: string;
	limit?: number;
	skip_synonyms?: boolean;
}
