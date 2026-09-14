export interface UserLastDraft {
	id: number;
	siteId: number;
	title: string;
}

export interface UserLastDraftResponse {
	posts?: Array< {
		ID?: number;
		site_ID?: number;
		title?: string;
	} >;
}
