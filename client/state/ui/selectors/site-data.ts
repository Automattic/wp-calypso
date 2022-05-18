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
	products?: SiteDataPlan[];
	capabilities?: Record< string, boolean >;
	is_wpcom_atomic?: boolean;
	// TODO: fill out the rest of this
}

export interface SiteDataPlan {
	product_id: number;
	product_slug: string;
	product_name?: string;
	product_name_short: string;
	expired: boolean;
	user_is_owner: boolean;
	is_free: boolean;
}

export interface DIFMLiteSiteOptions {
	site_category?: string;
	is_website_content_submitted?: boolean;
	selected_page_titles: string[];
}

export interface SiteDataOptions {
	admin_url: string | undefined;
	is_mapped_domain: boolean;
	jetpack_version: string | undefined;
	is_wpcom_atomic: boolean;
	is_automated_transfer: boolean;
	is_wpforteams_site: boolean;
	is_difm_lite_in_progress: boolean;
	is_domain_only: boolean;
	difm_lite_site_options?: DIFMLiteSiteOptions;
	// TODO: fill out the rest of this
}
