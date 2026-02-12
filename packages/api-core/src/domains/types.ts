export const DomainTypes = {
	MAPPED: 'mapping',
	SITE_REDIRECT: 'redirect',
	WPCOM: 'wpcom',
	TRANSFER: 'transfer',
} as const;

export type DomainTypes = ( typeof DomainTypes )[ keyof typeof DomainTypes ];

export const DomainTransferStatus = {
	PENDING_OWNER: 'pending_owner',
	PENDING_REGISTRY: 'pending_registry',
	CANCELLED: 'cancelled',
	COMPLETED: 'completed',
	PENDING_START: 'pending_start',
	PENDING_ASYNC: 'pending_async',
} as const;

export type DomainTransferStatus =
	( typeof DomainTransferStatus )[ keyof typeof DomainTransferStatus ];

export const DomainSubtype = {
	DEFAULT_ADDRESS: 'default_address',
	DOMAIN_CONNECTION: 'domain_connection',
	DOMAIN_REGISTRATION: 'domain_registration',
	DOMAIN_TRANSFER: 'domain_transfer',
	SITE_REDIRECT: 'site_redirect',
} as const;

export type DomainSubtype = ( typeof DomainSubtype )[ keyof typeof DomainSubtype ];

export const DomainStatus = {
	ACTIVE: 'active',
	IN_PROGRESS: 'in_progress',
	EXPIRED: 'expired',
	EXPIRED_IN_AUCTION: 'expired_in_auction',
	PENDING_RENEWAL: 'pending_renewal',
	PENDING_TRANSFER: 'pending_transfer',
	EXPIRING_SOON: 'expiring_soon',
	TRANSFER_COMPLETED: 'transfer_completed',
	CONNECTION_ERROR: 'connection_error',
	TRANSFER_PENDING: 'transfer_pending',
	TRANSFER_ERROR: 'transfer_error',
	PENDING_REGISTRATION: 'pending_registration',
} as const;

export type DomainStatus = ( typeof DomainStatus )[ keyof typeof DomainStatus ];

export const DomainStatusCta = {
	VIEW_DOMAIN: 'view_domain',
	VIEW_PURCHASE: 'view_purchase',
	VIEW_DOMAIN_SETUP: 'view_domain_setup',
	VIEW_TRANSFER_SETUP: 'view_transfer_setup',
} as const;

export type DomainStatusCta = ( typeof DomainStatusCta )[ keyof typeof DomainStatusCta ];

export interface DomainSummary {
	domain: string;
	subtype: {
		id: DomainSubtype;
		label: string;
	};
	blog_id: number;
	blog_name: string;
	site_slug: string;
	auto_renewing: boolean;
	current_user_is_owner: boolean | null;
	is_domain_only_site: boolean;
	expiry: string | null;
	expired: boolean;
	primary_domain: boolean;
	can_set_as_primary: boolean;
	domain_status: {
		id: DomainStatus;
		label: string;
		type: 'success' | 'warning' | 'error';
		cta?: DomainStatusCta;
	};
	subscription_id: string | null;
	tags: string[];
}

export type BulkDomainsAction =
	| {
			type: 'set-auto-renew';
			domains: string[];
			auto_renew: boolean;
	  }
	| {
			type: 'update-contact-info';
			domains: string[];
			transfer_lock: boolean;
			whois: Record< string, string | undefined >;
	  };

export interface BulkDomainUpdateStatus {
	results: {
		[ key: string ]: '' | 'success' | 'failed';
	};
	action: 'set_auto_renew' | 'update_contact_info';
	created_at: number;
	auto_renew?: boolean;
	whois?: unknown;
	transfer_lock?: boolean;
}

export interface BulkDomainUpdateStatusQueryFnData {
	[ key: string ]: BulkDomainUpdateStatus;
}

export interface JobStatus {
	id: string;
	action: 'set_auto_renew' | 'update_contact_info';
	created_at: number;
	success: string[];
	failed: string[];
	pending: string[];
	complete: boolean;
	params: {
		auto_renew?: boolean;
		whois?: unknown;
		transfer_lock?: boolean;
	};
}

interface DomainUpdateRemoteStatus {
	status: '' | 'success' | 'failed';
	action: 'set_auto_renew' | 'update_contact_info';
	created_at: number;
	auto_renew?: boolean;
	whois?: unknown;
	transfer_lock?: boolean;
}

interface DomainUpdateDerivedStatus {
	status: '';
	message: string;
	created_at: number;
}

export type DomainUpdateStatus = DomainUpdateRemoteStatus | DomainUpdateDerivedStatus;

export interface BulkDomainUpdateStatusResult {
	domainResults: Map< string, DomainUpdateStatus[] >;
	completedJobs: JobStatus[];
	allJobs: JobStatus[];
}
