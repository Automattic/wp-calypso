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
		id: string;
		label: string;
		type: 'success' | 'warning' | 'error';
		cta: string;
	};
	subscription_id: string | null;
	tags: string[];

	/*
	aftermarket_auction: boolean;
	can_manage_dns_records: boolean;
	can_update_contact_info: boolean;
	can_set_as_primary: boolean;
	cannot_update_contact_info_reason: string | null;
	cannot_manage_name_servers_reason: string | null;
	cannot_manage_dns_records_reason: string | null;
	current_user_can_add_email: boolean;
	current_user_can_create_site_from_domain_only: boolean;
	current_user_can_manage: boolean;
	email_forwards_count: number;
	expired: boolean;
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
	transfer_status: DomainTransferStatus | null;
	type: DomainTypes;
	wpcom_domain: boolean;
	last_transfer_error?: string;
	transfer_start_date?: string;
	*/
}
