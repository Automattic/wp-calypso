export interface ReadTag {
	ID: string;
	slug: string;
	title: string;
	display_name: string;
	URL: string;
	description?: string;
}

export interface ReadTagsResponse {
	tags: ReadTag[];
}

export interface ReadSingleTagResponse {
	tag: ReadTag;
}
