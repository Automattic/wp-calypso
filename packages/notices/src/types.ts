export interface SiteData {
	ID: number;
	name: string;
	URL: string;
	slug: string;
	domain: string;
	locale: string;
	options?: SiteDataOptions;
	// TODO: fill out the rest of this
}

export interface SiteDataOptions {
	admin_url: string | undefined;
	is_redirect: boolean;
	// TODO: fill out the rest of this
}
