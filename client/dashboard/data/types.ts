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

export interface Plan {
	product_id: number;
	product_slug: string;
	product_name: string;
	expired: boolean;
	billing_period: 'Yearly' | 'Monthly';
	features: {
		active: string[];
	};
}

export interface SiteOptions {
	software_version: string;
	admin_url: string;
}

export interface Site {
	id: string;
	name: string;
	url: string;
	media: string;
	backups: 'enabled' | 'disabled';
	protect: 'enabled' | 'disabled';
	subscribers: number;
	plan: Plan;
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
