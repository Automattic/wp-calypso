export interface User {
	user_login: string;
	display_name: string;
	user_email: string;
	user_URL: string;
	description: string;
	isDeveloper: boolean;
	avatar_URL: string;
}

export interface Domain {
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
}

export interface Site {
	id: string;
	name: string;
	url: string;
	media?: string;
	backups: 'enabled' | 'disabled';
	protect: 'enabled' | 'disabled';
	subscribers: number;
	plan: SitePlan;
	options: SiteOptions;
	is_deleted: boolean;
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

export interface MediaStorageObject {
	maxStorageBytesFromAddOns: number;
	maxStorageBytes: number;
	storageUsedBytes: number;
}

export interface MonitorUptimeAPIResponse {
	[ key: string ]: { status: string; downtime_in_minutes?: number };
}
export interface FetchSiteRouteResponse {
	site: Site;
	mediaStorage: MediaStorageObject;
	siteMonitorUptime: MonitorUptimeAPIResponse;
	phpVersion: string;
	currentPlan: Plan;
}
