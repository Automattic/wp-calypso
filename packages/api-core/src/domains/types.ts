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

export interface DomainSummary {
	aftermarket_auction: boolean;
	auto_renewing: boolean;
	blog_id: number;
	blog_name: string;
	can_manage_dns_records: boolean;
	can_update_contact_info: boolean;
	can_set_as_primary: boolean;
	cannot_update_contact_info_reason: string | null;
	cannot_manage_name_servers_reason: string | null;
	cannot_manage_dns_records_reason: string | null;
	current_user_can_create_site_from_domain_only: boolean;
	current_user_can_manage: boolean;
	current_user_is_owner: boolean | null;
	domain: string;
	domain_status?: {
		status: string;
		status_type: 'success' | 'neutral' | 'error';
	};
	email_forwards_count: number;
	expired: boolean;
	expiry: string | false;
	has_registration: boolean;
	is_domain_only_site: boolean;
	is_eligible_for_inbound_transfer: boolean;
	is_hundred_year_domain: boolean;
	is_pending_whois_update: boolean;
	is_redeemable: boolean;
	is_renewable: boolean;
	is_wpcom_staging_domain: boolean;
	pending_registration: boolean;
	pending_registration_at_registry: boolean;
	pending_renewal: boolean;
	pending_transfer: boolean;
	points_to_wpcom: boolean;
	primary_domain: boolean;
	registration_date: string;
	site_slug: string;
	subscription_id: string;
	subtype: {
		id: DomainSubtype;
		label: string;
	};
	transfer_status: DomainTransferStatus | null;
	type: DomainTypes;
	wpcom_domain: boolean;
	last_transfer_error?: string;
	transfer_start_date?: string;
}
