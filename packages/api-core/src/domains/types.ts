export enum DomainTypes {
	MAPPED = 'mapping',
	SITE_REDIRECT = 'redirect',
	WPCOM = 'wpcom',
	TRANSFER = 'transfer',
}

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

export enum DomainSubtype {
	DEFAULT_ADDRESS = 'default_address',
	DOMAIN_CONNECTION = 'domain_connection',
	DOMAIN_REGISTRATION = 'domain_registration',
	DOMAIN_TRANSFER = 'domain_transfer',
	SITE_REDIRECT = 'site_redirect',
}

export enum DomainStatus {
	ACTIVE = 'active',
	IN_PROGRESS = 'in_progress',
	EXPIRED = 'expired',
	EXPIRED_IN_AUCTION = 'expired_in_auction',
	PENDING_RENEWAL = 'pending_renewal',
	PENDING_TRANSFER = 'pending_transfer',
	EXPIRING_SOON = 'expiring_soon',
	TRANSFER_COMPLETED = 'transfer_completed',
	CONNECTION_ERROR = 'connection_error',
	TRANSFER_PENDING = 'transfer_pending',
	TRANSFER_ERROR = 'transfer_error',
	PENDING_REGISTRATION = 'pending_registration',
}

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
	expiry: string | false;
	expired: boolean;
	primary_domain: boolean;
	can_set_as_primary: boolean;
	domain_status: {
		id: DomainStatus;
		label: string;
		type: 'success' | 'warning' | 'error';
		cta: string;
	};
	subscription_id: string | null;
	tags: string[];
}
