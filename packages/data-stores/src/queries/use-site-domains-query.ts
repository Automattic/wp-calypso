import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';

interface DnssecRecords {
	dnskey?: string;
	dsData?: Array< string >;
}

export interface DomainData {
	primary_domain: boolean;
	blog_name: string;
	blog_id: number;
	subscription_id: string;
	can_manage_dns_records: boolean;
	can_manage_name_servers: boolean;
	can_update_contact_info: boolean;
	cannot_manage_dns_records_reason: unknown;
	cannot_manage_name_servers_reason: unknown;
	cannot_update_contact_info_reason: string | null;
	connection_mode: unknown;
	current_user_can_add_email: boolean;
	current_user_can_create_site_from_domain_only: boolean;
	current_user_cannot_add_email_reason: {
		errors: {
			[ key: string ]: string[];
		};
	};
	current_user_can_manage: boolean;
	current_user_is_owner: boolean;
	can_set_as_primary: boolean;
	can_transfer_to_any_user: boolean;
	can_transfer_to_other_site: boolean;
	dnssec_records?: DnssecRecords;
	domain: string;
	domain_notice_states: unknown;
	supports_domain_connect: unknown;
	email_forwards_count: number;
	expiry: string;
	expiry_soon: boolean;
	expired: boolean;
	auto_renewing: boolean;
	pending_registration: boolean;
	pending_registration_time: string;
	has_registration: boolean;
	has_email_forward_dns_records: unknown;
	points_to_wpcom: boolean;
	privacy_available: boolean;
	private_domain: boolean;
	partner_domain: boolean;
	wpcom_domain: boolean;
	has_pending_contact_update: boolean;
	has_zone: boolean;
	is_dnssec_enabled: boolean;
	is_dnssec_supported: boolean;
	is_gravatar_domain: boolean;
	is_gravatar_restricted_domain: boolean;
	is_hundred_year_domain: boolean;
	is_renewable: boolean;
	is_redeemable: boolean;
	is_subdomain: boolean;
	is_eligible_for_inbound_transfer: boolean;
	is_locked: boolean;
	is_wpcom_staging_domain: boolean;
	transfer_away_eligible_at: string;
	type: 'mapping' | 'wpcom' | 'registered' | 'redirect' | 'transfer';
	registration_date: string;
	auto_renewal_date: string;
	google_apps_subscription: {
		status: string;
		is_eligible_for_introductory_offer: boolean;
		total_user_count: number;
	};
	titan_mail_subscription: {
		status: string;
		is_eligible_for_introductory_offer: boolean;
		maximum_mailbox_count: number;
	};
	pending_whois_update: boolean;
	tld_maintenance_end_time: 0;
	ssl_status: 'active' | 'pending' | 'newly_registered' | 'disabled' | null;
	gdpr_consent_status: string;
	supports_gdpr_consent_management: boolean;
	supports_transfer_approval: boolean;
	domain_registration_agreement_url: string;
	contact_info_disclosure_available: boolean;
	contact_info_disclosed: boolean;
	renewable_until: string;
	redeemable_until: string;
	bundled_plan_subscription_id: string | number | null | undefined;
	product_slug: string;
	owner: string;
	pending_renewal: boolean;
	aftermarket_auction: boolean;
	aftermarket_auction_start: unknown;
	aftermarket_auction_end: string | null;
	nominet_pending_contact_verification_request: boolean;
	nominet_domain_suspended: boolean;
	transfer_status:
		| 'pending_owner'
		| 'pending_registry'
		| 'cancelled'
		| 'completed'
		| 'pending_start'
		| 'pending_async'
		| null;
	last_transfer_error: string;
	has_private_registration: boolean;
	is_pending_icann_verification: boolean;
	is_icann_verification_suspended: boolean;
	manual_transfer_required: boolean;
	registrar: string;
	domain_locking_available: boolean;
	is_premium: boolean;
	transfer_lock_on_whois_update_optional: boolean;
	transfer_start_date: string;
	whois_update_unmodifiable_fields: [];
	is_whois_editable: boolean;
	pending_transfer: boolean;
	has_wpcom_nameservers: boolean;
	admin_email: string;
	a_records_required_for_mapping: [];
	begin_transfer_until_date: string;
	must_remove_privacy_before_contact_update: boolean;
	registry_expiry_date: string;
	subdomain_part: string;
	auth_code_required: boolean;
	is_mapped_to_atomic_site: boolean;
	is_move_to_new_site_pending: boolean;
	pending_registration_at_registry: boolean;
	pending_registration_at_registry_url: string;
	registered_via_trustee: boolean;
	registered_via_trustee_url: string;
	domain_status?: {
		status: string;
		status_type: string;
		status_weight: number;
	};
}

export interface SiteDomainsQueryFnData {
	domains: DomainData[];
}

export const getSiteDomainsQueryKey = ( siteIdOrSlug: number | string | null | undefined ) => [
	'site-domains',
	siteIdOrSlug,
];

export function useSiteDomainsQuery< TError = unknown, TData = SiteDomainsQueryFnData >(
	siteIdOrSlug: number | string | null | undefined,
	options: Omit< UseQueryOptions< SiteDomainsQueryFnData, TError, TData >, 'queryKey' > = {}
) {
	return useQuery( getSiteDomainsQueryObject( siteIdOrSlug, options ) );
}

export function getSiteDomainsQueryObject< TError = unknown, TData = SiteDomainsQueryFnData >(
	siteIdOrSlug: number | string | null | undefined,
	options: Omit< UseQueryOptions< SiteDomainsQueryFnData, TError, TData >, 'queryKey' > = {}
): UseQueryOptions< SiteDomainsQueryFnData, TError, TData > {
	return {
		queryKey: getSiteDomainsQueryKey( siteIdOrSlug ),
		queryFn: () =>
			wpcomRequest< SiteDomainsQueryFnData >( {
				path: `/sites/${ siteIdOrSlug }/domains`,
				apiVersion: '1.2',
			} ),
		staleTime: 1000 * 60 * 5, // 5 minutes
		...options,
		meta: { persist: false, ...options.meta },
		enabled: Boolean( siteIdOrSlug ) && options.enabled,
	};
}
