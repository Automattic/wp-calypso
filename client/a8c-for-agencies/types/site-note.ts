export default interface SiteNote {
	id: number;
	site_id: number;
	author_id: number;
	author_name: string;
	author_gravatar: string;
	date: string;
	content: string;
}
