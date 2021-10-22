export interface Theme {
	author: string;
	author_uri: string;
	cost: {
		currency: string;
		number: number;
		display: string;
	};
	date_launched: string;
	date_updated: string;
	demo_uri: string;
	description: string;
	descriptionLong: string;
	download: string;
	download_url: string;
	id: string;
	launch_date: string;
	license: string;
	license_uri: string;
	name: string;
	next: string;
	popularity_rank: string;
	preview_url: string;
	screenshot: string;
	screenshots: string[];
	stylesheet: string;
	supportDocumentation: string;
	tags: string[];
	taxonomies?: {
		theme_feature?: { name: string; slug: string; term_id: string }[];
	};
	template: string;
	theme_uri: string;
	trending_rank: number;
	version: string;
}
