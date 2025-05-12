import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render as rtlRender, RenderResult, RenderOptions } from '@testing-library/react';
import React from 'react';
import type { PartialDomainData, DomainData, SiteDetails } from '@automattic/data-stores';

export function renderWithProvider(
	ui: React.ReactElement,
	renderOptions: Omit< RenderOptions, 'queries' > = {}
): RenderResult {
	const queryClient = new QueryClient();

	const Wrapper = ( { children }: { children: React.ReactNode } ) => {
		if ( renderOptions.wrapper ) {
			children = <renderOptions.wrapper>{ children }</renderOptions.wrapper>;
		}
		return <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>;
	};

	return rtlRender( ui, { ...renderOptions, wrapper: Wrapper } );
}

export function testSite( defaults: Partial< SiteDetails > ) {
	return {
		...defaults,
		options: {
			...defaults.options,
		},
	};
}

export function testDomain(
	defaults: Partial< DomainData > = {}
): [ PartialDomainData, DomainData ] {
	const defaultPartialDomain: PartialDomainData = {
		domain: 'example.com',
		blog_id: 113,
		type: 'mapping',
		is_wpcom_staging_domain: false,
		is_hundred_year_domain: false,
		has_registration: true,
		registration_date: '2020-03-11T22:23:58+00:00',
		expiry: '2026-03-11T00:00:00+00:00',
		wpcom_domain: false,
		current_user_is_owner: true,
		current_user_can_add_email: false,
		google_apps_subscription: {
			status: '',
			is_eligible_for_introductory_offer: false,
			total_user_count: 0,
		},
		titan_mail_subscription: {
			status: '',
			is_eligible_for_introductory_offer: false,
			maximum_mailbox_count: 0,
		},
		email_forwards_count: 0,
		tld_maintenance_end_time: 0,
		auto_renewing: false,
	};

	const partialOnlyDefaults = Object.entries( defaults ).filter( ( [ key ] ) =>
		Object.hasOwn( defaultPartialDomain, key )
	);

	const partialDomain = { ...defaultPartialDomain, ...Object.fromEntries( partialOnlyDefaults ) };

	const fullDomain: DomainData = {
		...defaultPartialDomain,
		blog_name: 'Example',
		primary_domain: false,
		subscription_id: '',
		can_manage_dns_records: false,
		can_manage_name_servers: false,
		can_update_contact_info: false,
		cannot_manage_dns_records_reason: null,
		cannot_manage_name_servers_reason: null,
		cannot_update_contact_info_reason: null,
		can_transfer_to_any_user: true,
		can_transfer_to_other_site: true,
		connection_mode: null,
		current_user_can_add_email: false,
		current_user_can_create_site_from_domain_only: false,
		current_user_cannot_add_email_reason: {
			errors: {},
		},
		current_user_can_manage: false,
		can_set_as_primary: false,
		domain_notice_states: null,
		supports_domain_connect: null,
		email_forwards_count: 0,
		expiry_soon: false,
		expired: false,
		auto_renewing: false,
		pending_registration: false,
		has_email_forward_dns_records: null,
		points_to_wpcom: false,
		privacy_available: false,
		private_domain: false,
		partner_domain: false,
		has_pending_contact_update: false,
		has_zone: false,
		is_dnssec_enabled: false,
		is_dnssec_supported: true,
		is_gravatar_domain: false,
		is_gravatar_restricted_domain: false,
		is_hundred_year_domain: false,
		is_renewable: false,
		is_redeemable: false,
		is_subdomain: false,
		is_eligible_for_inbound_transfer: false,
		is_locked: false,
		transfer_away_eligible_at: '',
		auto_renewal_date: '',
		google_apps_subscription: {
			status: '',
			is_eligible_for_introductory_offer: false,
			total_user_count: 0,
		},
		titan_mail_subscription: {
			status: '',
			is_eligible_for_introductory_offer: false,
			maximum_mailbox_count: 0,
		},
		pending_whois_update: false,
		tld_maintenance_end_time: 0,
		ssl_status: null,
		gdpr_consent_status: '',
		supports_gdpr_consent_management: false,
		supports_transfer_approval: false,
		domain_registration_agreement_url: '',
		contact_info_disclosure_available: false,
		contact_info_disclosed: false,
		renewable_until: '',
		redeemable_until: '',
		bundled_plan_subscription_id: null,
		product_slug: '',
		owner: '',
		pending_renewal: false,
		aftermarket_auction: false,
		aftermarket_auction_start: null,
		aftermarket_auction_end: null,
		nominet_pending_contact_verification_request: false,
		nominet_domain_suspended: false,
		transfer_status: null,
		last_transfer_error: '',
		has_private_registration: false,
		is_pending_icann_verification: false,
		is_root_domain_registered_with_automattic: false,
		manual_transfer_required: false,
		registrar: '',
		domain_locking_available: false,
		is_premium: false,
		transfer_lock_on_whois_update_optional: false,
		whois_update_unmodifiable_fields: [],
		is_whois_editable: false,
		pending_transfer: false,
		has_wpcom_nameservers: false,
		is_icann_verification_suspended: false,
		transfer_start_date: '',
		admin_email: '',
		a_records_required_for_mapping: [],
		begin_transfer_until_date: '',
		must_remove_privacy_before_contact_update: false,
		registry_expiry_date: '',
		subdomain_part: '',
		auth_code_required: true,
		is_mapped_to_atomic_site: false,
		is_move_to_new_site_pending: false,
		pending_registration_at_registry: false,
		pending_registration_at_registry_url: '',
		registered_via_trustee: false,
		registered_via_trustee_url: '',
		...defaults,
	};

	return [ partialDomain, fullDomain ];
}

export function testPartialDomain( defaults: Partial< PartialDomainData > = {} ) {
	return testDomain( defaults )[ 0 ];
}

export function testFullDomain( defaults: Partial< PartialDomainData > = {} ) {
	return testDomain( defaults )[ 1 ];
}
