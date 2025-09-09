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

interface Icons {
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

export interface WpComPlugin {
	id: number;
	wccom_id: string;
	name: string;
	slug: string;
	software_slug: string;
	org_slug: string;
	short_description: string;
	description: string;
	requirements: {
		required_primary_domain: number;
		plugins: string[];
		themes: string[];
	};
	variations: {
		monthly: {
			product_id: number;
		};
		yearly: {
			product_id: number;
		};
	};
	icons: string;
	banners: {
		high: string;
	};
	tags: {
		[ key: string ]: string;
	};
	sections: {
		description: string;
	};
	rating: string;
	reviews_link: string;
	author: string;
	author_profile: string | null;
	demo_url: string | null;
	documentation_url: string | null;
	version: string;
	last_updated: string;
	product_video: string | null;
	setup_url: string;
	is_hidden: boolean;
	saas_landing_page: string | null;
}
