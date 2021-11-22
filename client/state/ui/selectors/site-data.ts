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
	plan: SiteDataPlan;
	// TODO: fill out the rest of this
}

export interface SiteDataPlan {
	product_id: number;
	product_slug: string;
	product_name_short: string;
	expired: boolean;
	user_is_owner: boolean;
	is_free: boolean;
}

export interface SiteDataOptions {
	admin_url: string | undefined;
	is_mapped_domain: boolean;
	jetpack_version: string | undefined;
	// TODO: fill out the rest of this
}
