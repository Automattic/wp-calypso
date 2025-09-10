export interface MarketplacePlugin {
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
