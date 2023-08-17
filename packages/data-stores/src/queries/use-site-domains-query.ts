import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';

export interface DomainData {
	primary_domain: boolean;
	blog_id: number;
	subscription_id: string;
	can_manage_dns_records: boolean;
	can_manage_name_servers: boolean;
	can_update_contact_info: boolean;
	cannot_manage_dns_records_reason: unknown;
	cannot_manage_name_servers_reason: unknown;
	cannot_update_contact_info_reason: unknown;
	connection_mode: unknown;
	current_user_can_add_email: boolean;
	current_user_can_create_site_from_domain_only: boolean;
	current_user_cannot_add_email_reason: unknown;
	current_user_can_manage: boolean;
	current_user_is_owner: boolean;
	can_set_as_primary: boolean;
	domain: string;
	domain_notice_states: unknown;
	supports_domain_connect: unknown;
	email_forwards_count: 0;
	expiry: string;
	expiry_soon: boolean;
	expired: boolean;
	auto_renewing: 0;
	pending_registration: boolean;
	pending_registration_time: string;
	has_registration: boolean;
	has_email_forward_dns_records: unknown;
	points_to_wpcom: boolean;
	privacy_available: boolean;
	private_domain: boolean;
	partner_domain: boolean;
	wpcom_domain: boolean;
	has_zone: boolean;
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
	};
	titan_mail_subscription: {
		status: string;
		is_eligible_for_introductory_offer: boolean;
	};
	pending_whois_update: boolean;
	tld_maintenance_end_time: 0;
	ssl_status: string;
	supports_gdpr_consent_management: boolean;
	supports_transfer_approval: boolean;
	domain_registration_agreement_url: string;
	contact_info_disclosure_available: boolean;
	contact_info_disclosed: boolean;
	renewable_until: string;
	redeemable_until: unknown;
	bundled_plan_subscription_id: unknown;
	product_slug: string;
	owner: string;
	pending_renewal: boolean;
	aftermarket_auction: boolean;
	aftermarket_auction_start: unknown;
	aftermarket_auction_end: unknown;
	nominet_pending_contact_verification_request: boolean;
	nominet_domain_suspended: boolean;
	transfer_status: unknown;
	last_transfer_error: string;
	has_private_registration: boolean;
	is_pending_icann_verification: boolean;
	manual_transfer_required: boolean;
	registrar: string;
	domain_locking_available: boolean;
	is_premium: boolean;
	transfer_lock_on_whois_update_optional: boolean;
	whois_update_unmodifiable_fields: [];
	is_whois_editable: boolean;
	pending_transfer: boolean;
	has_wpcom_nameservers: boolean;
}

export interface SiteDomainsQueryFnData {
	domains: DomainData[];
}

export function useSiteDomainsQuery(
	siteIdOrSlug: number | string | null | undefined,
	options: UseQueryOptions< SiteDomainsQueryFnData > = {}
) {
	return useQuery( {
		queryKey: [ 'site-domains', siteIdOrSlug ],
		queryFn: () =>
			wpcomRequest< SiteDomainsQueryFnData >( {
				path: `/sites/${ siteIdOrSlug }/domains`,
				apiVersion: '1.2',
			} ),
		enabled: Boolean( siteIdOrSlug ) && options.enabled,
		...options,
	} );
}
