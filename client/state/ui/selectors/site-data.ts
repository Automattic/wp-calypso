// TODO: put this somewhere more appropriate

export interface SiteData {
	ID: number;
	name: string;
	URL: string;
	slug: string;
	domain: string;
	locale: string;
	options?: SiteDataOptions;
	wpcom_url?: string;
	jetpack?: boolean;
	// TODO: fill out the rest of this
}

export interface SiteDataOptions {
	admin_url: string | undefined;
	is_mapped_domain: boolean;
	// TODO: fill out the rest of this
}
