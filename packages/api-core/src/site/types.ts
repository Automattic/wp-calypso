export interface SitePlan {
	product_id: number;
	product_slug: string;
	product_name: string;
	product_name_short: string;
	expired: boolean;
	is_free: boolean;
	license_key: string;
	billing_period: 'Yearly' | 'Monthly';
	features: {
		active: string[];
	};
}

export interface SiteCapabilities {
	manage_options: boolean;
}

export interface SiteOptions {
	admin_url: string;
	created_at?: string;
	is_difm_lite_in_progress?: boolean;
	is_summer_special_2025?: boolean;
	is_wpforteams_site?: boolean;
	migration_source_site_domain?: string;
	p2_hub_blog_id?: number;
	site_creation_flow?: string;
	site_intent?: string;
	software_version: string;
	updated_at?: string;
	wordads?: boolean;
	wpcom_production_blog_id?: number;
	wpcom_staging_blog_ids?: number[];
}

export interface Site {
	ID: number;
	slug: string;
	name: string;
	URL: string;
	icon?: {
		ico: string;
	};
	plan?: SitePlan;
	capabilities: SiteCapabilities;
	subscribers_count?: number; // Can be undefined if query cache is prefilled from old Calypso Redux store.
	options?: SiteOptions; // Can be undefined for deleted sites.
	is_a4a_dev_site: boolean;
	is_a8c: boolean;
	is_deleted: boolean;
	is_coming_soon: boolean;
	is_private: boolean;
	is_wpcom_atomic: boolean;
	is_wpcom_staging_site: boolean;
	is_vip: boolean;
	lang: string;
	launch_status: string | boolean;
	site_migration: {
		migration_status?: string;
		in_progress: boolean;
		is_complete: boolean;
	};
	site_owner: number;
	jetpack: boolean;
	jetpack_connection: boolean;
	jetpack_modules: string[] | null;
	hosting_provider_guess?: string;
	was_ecommerce_trial: boolean;
	was_migration_trial: boolean;
	was_hosting_trial: boolean;
	was_upgraded_from_trial: boolean;
}
