import { DomainSummary, DomainTransferStatus, DomainTypes } from '../domains';

export const EmailSubscriptionStatus = {
	NO_SUBSCRIPTION: 'no_subscription',
	ACTIVE: 'active',
	DELETED: 'deleted',
	SUSPENDED: 'suspended',
} as const;

export type EmailSubscriptionStatus =
	( typeof EmailSubscriptionStatus )[ keyof typeof EmailSubscriptionStatus ];

interface EmailSubscription {
	status: 'active' | 'pending' | 'suspended' | 'no_subscription' | 'other_provider';
	product_slug: string;
}

export interface EmailCost {
	amount: number;
	currency: string;
	text: string;
}

export interface GoogleEmailSubscription extends EmailSubscription {
	total_user_count: number;
}

export interface TitanEmailSubscription extends EmailSubscription {
	expiry_date: string;
	order_id: number;
	maximum_mailbox_count: number;
	is_eligible_for_introductory_offer?: boolean;
	purchase_cost_per_mailbox?: EmailCost;
	renewal_cost_per_mailbox?: EmailCost;
}

export interface Domain extends DomainSummary {
	auth_code_required: boolean;
	aftermarket_auction: boolean;
	auto_renewal_date: string;
	can_manage_name_servers: boolean;
	can_manage_dns_records: boolean;
	can_update_contact_info: boolean;
	can_transfer_to_any_user: boolean;
	can_transfer_to_other_site: boolean;
	cannot_manage_name_servers_reason: string | null;
	cannot_manage_dns_records_reason: string | null;
	cannot_update_contact_info_reason: string | null;
	current_user_can_manage: boolean;
	contact_info_disclosure_available: boolean;
	contact_info_disclosed: boolean;
	current_user_cannot_add_email_reason: {
		errors: {
			[ key: string ]: string[];
		};
	} | null;
	dnssec_records?: {
		dnskey: string[];
		ds_data: string[];
	};
	domain_locking_available: boolean;
	has_wpcom_nameservers: boolean;
	is_dnssec_enabled: boolean;
	is_dnssec_supported: boolean;
	is_domain_only_site: boolean;
	is_eligible_for_inbound_transfer: boolean;
	is_gravatar_domain: boolean;
	is_gravatar_restricted_domain: boolean;
	is_locked: boolean;
	is_pending_whois_update: boolean;
	is_root_domain_registered_with_automattic: boolean;
	is_redeemable: boolean;
	is_hundred_year_domain: boolean;
	is_subdomain: boolean;
	is_pending_icann_verification: boolean;
	is_wpcom_staging_domain?: boolean;
	move_to_new_site_pending: boolean;
	nominet_pending_contact_verification_request: boolean;
	nominet_domain_suspended: boolean;
	owner: string;
	is_pending_registration: boolean;
	is_pending_registration_at_registry: boolean;
	private_domain: boolean;
	privacy_available: boolean;
	points_to_wpcom: boolean;
	pending_registration: boolean;
	pending_registration_at_registry: boolean;
	pending_transfer: boolean;
	renewable_until: string;
	ssl_status: 'active' | 'inactive' | 'newly_registered' | 'pending';
	subdomain_part: string;
	transfer_status: DomainTransferStatus | null;
	transfer_away_eligible_at: string;
	type: DomainTypes;
	wpcom_domain?: boolean;
	registration_date: string;
	email_forwards_count?: number;
	google_apps_subscription?: GoogleEmailSubscription | null;
	titan_mail_subscription?: TitanEmailSubscription | null;
	transfer_start_date?: string;
	last_transfer_error: string;
	current_user_can_add_email: boolean;
}
