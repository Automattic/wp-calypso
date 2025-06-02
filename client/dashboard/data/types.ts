export interface Profile {
	user_login: string;
	display_name: string;
	user_email: string;
	user_URL: string;
	description: string;
	is_dev_account: boolean;
	avatar_URL: string;
}

export interface User {
	ID: number;
	username: string;
	display_name: string;
	avatar_URL?: string;
	language: string;
	locale_variant: string;
	email: string;
}

export interface SiteUser {
	id: number;
}

export interface SiteDomain {
	id: number;
	domain: string;
	blog_id: number;
	owner: string;
	expiry: string;
	domain_status: {
		status: string;
	};
	wpcom_domain: boolean;
	sslStatus: string;
	domain_type: string;
	primary_domain: boolean;
}

export interface Domain {
	domain: string;
	blog_id: number;
	blog_name: string;
	expiry: string;
	domain_status: {
		status: string;
	};
	wpcom_domain: boolean;
	type: string;
}

export interface SitePlan {
	product_slug: string;
	product_name: string;
	product_name_short: string;
	expired: boolean;
	is_free: boolean;
	billing_period: 'Yearly' | 'Monthly';
	features: {
		active: string[];
	};
}

export interface Plan {
	id: string | null;
	current_plan?: boolean;
	expiry?: string;
	subscribed_date?: string;
	user_facing_expiry?: string;
}

export interface SiteCapabilities {
	manage_options: boolean;
}

export interface SiteOptions {
	software_version: string;
	admin_url: string;
	is_redirect?: boolean;
	p2_hub_blog_id?: number;
	is_wpforteams_site?: boolean;
}

export interface Site {
	ID: string;
	slug: string;
	name: string;
	URL: string;
	icon?: {
		ico: string;
	};
	plan?: SitePlan;
	capabilities: SiteCapabilities;
	subscribers_count: number;
	// Can be undefined for deleted sites.
	options?: SiteOptions;
	is_a8c: boolean;
	is_deleted: boolean;
	is_coming_soon: boolean;
	is_private: boolean;
	is_wpcom_atomic: boolean;
	is_wpcom_staging_site: boolean;
	is_vip: boolean;
	launch_status: string | boolean;
	site_migration: {
		migration_status?: string;
		in_progress: boolean;
		is_complete: boolean;
	};
	site_owner: number;
	jetpack: boolean;
	jetpack_modules: string[] | null;
}

export interface Purchase {
	ID: number | string;
	active: boolean;
	is_cancelable: boolean;
	product_slug: string;
	user_id: number | string;
}

export type EmailProvider = 'titan' | 'google-workspace' | 'forwarding';
export interface EmailProviderDisplay {
	id: EmailProvider;
	displayName: string;
}
export interface Email {
	id: string;
	emailAddress: string;
	type: 'mailbox' | 'forwarding';
	provider: EmailProvider;
	providerDisplayName: string;
	domainName: string;
	siteId?: string;
	siteName?: string;
	forwardingTo?: string;
	storageUsed?: number;
	storageLimit?: number;
	createdDate: string;
	status: 'active' | 'pending' | 'suspended';
}

export interface TwoStep {
	two_step_reauthorization_required: boolean;
}

export interface MediaStorage {
	maxStorageBytesFromAddOns: number;
	maxStorageBytes: number;
	storageUsedBytes: number;
}

export interface MonitorUptime {
	[ key: string ]: { status: string; downtime_in_minutes?: number };
}

export interface EngagementStatsDataPoint {
	visitors: number;
	views: number;
	likes: number;
	comments: number;
}
export interface EngagementStats {
	currentData: EngagementStatsDataPoint;
	previousData: EngagementStatsDataPoint;
}

export interface SiteSettings {
	wpcom_site_visibility?: 'coming-soon' | 'public' | 'private';
	wpcom_discourage_search_engines?: boolean;
	wpcom_prevent_third_party_sharing?: boolean;
	wpcom_gifting_subscription?: boolean;
	wpcom_performance_report_url?: string;
}

export interface BasicMetricsData {
	token?: string;
}

export interface PerformanceReport {
	overall_score: number;
}

export interface UrlPerformanceInsights {
	pagespeed: {
		status: string;
		mobile: PerformanceReport | string;
		desktop: PerformanceReport | string;
	};
	wpscan: {
		status: string;
	};
}

export interface PhpMyAdminToken {
	token: string;
}

export interface DefensiveModeSettings {
	enabled: boolean;
	enabled_by_a11n: boolean;
	enabled_until: number;
}
export interface DefensiveModeSettingsUpdate {
	active: boolean;
	ttl?: number;
}

export interface SiteTransferConfirmation {
	transfer: boolean;
	email_sent: boolean;
	new_owner_email: string;
}

export type SiteResetContentSummary = {
	post_count: number;
	page_count: number;
	media_count: number;
	plugin_count: number;
};

export type SiteResetStatus = {
	status: 'in-progress' | 'ready' | 'completed';
	progress: number;
};
