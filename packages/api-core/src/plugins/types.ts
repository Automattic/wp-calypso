interface Contributor {
	profile: string;
	avatar: string;
	display_name: string;
}

interface Ratings {
	[ key: string ]: number;
}

interface Sections {
	description: string;
	faq: string;
	changelog: string;
	reviews: string;
}

interface Banners {
	low: string;
	high: string;
}

export interface Icons {
	'1x': string;
	'2x': string;
}

export interface WpOrgPlugin {
	name: string;
	slug: string;
	version: string;
	author: string;
	author_profile: string;
	contributors: Record< string, Contributor >;
	requires: string;
	tested: string;
	requires_php: string;
	requires_plugins: string[];
	rating: number;
	ratings: Ratings;
	num_ratings: number;
	support_url: string;
	support_threads: number;
	support_threads_resolved: number;
	active_installs: number;
	last_updated: string;
	sections: Sections;
	short_description: string;
	download_link: string;
	upgrade_notice: [];
	screenshots: [];
	tags: [];
	versions: Record< string, string >;
	business_model: string;
	repository_url: string;
	commercial_support_url: string;
	banners: Banners;
	icons: Icons;
	preview_link: string;
}
