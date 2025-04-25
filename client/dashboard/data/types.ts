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
	username: string;
	display_name: string;
	avatar_URL?: string;
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
	id: string;
	current_plan?: boolean;
	expiry?: string;
	subscribed_date?: string;
	user_facing_expiry?: string;
}

export interface SiteOptions {
	software_version: string;
	admin_url: string;
	is_wpcom_atomic?: boolean;
	blog_public: number;
	is_redirect?: boolean;
}

export interface Site {
	ID: string;
	name: string;
	URL: string;
	icon?: {
		ico: string;
	};
	plan: SitePlan;
	active_modules?: string[];
	subscribers_count: number;
	// Can be undefined for deleted sites.
	options?: SiteOptions;
	is_deleted: boolean;
	is_coming_soon: boolean;
	is_private: boolean;
	launch_status: string | boolean;
	site_migration: {
		migration_status: string;
	} | null;
	site_owner: number;
	jetpack: boolean;
	jetpack_modules: string[];
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

export type PerformanceReport = {
	overall_score: number;
};
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
