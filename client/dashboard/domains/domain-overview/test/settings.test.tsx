/**
 * @jest-environment jsdom
 */
import { DomainSubtype, type Domain } from '@automattic/api-core';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../../../test-utils';
import DomainOverviewSettings from '../settings';

const domainName = 'example.com';

const getMockedDomainData = ( customProps: Partial< Domain > = {} ): Domain => {
	return {
		domain: domainName,
		aftermarket_auction: false,
		auto_renewing: false,
		blog_id: 123,
		blog_name: 'Test Blog',
		can_manage_dns_records: true,
		can_update_contact_info: true,
		can_set_as_primary: true,
		current_user_can_create_site_from_domain_only: false,
		current_user_can_manage: true,
		current_user_is_owner: true,
		domain_status: { status: 'active' },
		expired: false,
		expiry: null,
		is_dnssec_enabled: false,
		is_dnssec_supported: true,
		is_eligible_for_inbound_transfer: false,
		is_hundred_year_domain: false,
		is_gravatar_domain: false,
		is_gravatar_restricted_domain: false,
		move_to_new_site_pending: false,
		can_manage_name_servers: true,
		cannot_manage_name_servers_reason: null,
		is_redeemable: false,
		is_renewable: true,
		is_wpcom_staging_domain: false,
		pending_registration: false,
		pending_registration_at_registry: false,
		pending_renewal: false,
		pending_transfer: false,
		points_to_wpcom: false,
		registration_date: '2023-01-01',
		subscription_id: 'sub123',
		transfer_status: null,
		wpcom_domain: true,
		subtype: {
			id: DomainSubtype.DOMAIN_REGISTRATION,
			label: 'Domain Registration',
		},
		ssl_status: 'disabled',
		private_domain: false,
		...customProps,
	} as Domain;
};

function renderDomainSettings( domainProps: Partial< Domain > = {} ) {
	const mockDomain = getMockedDomainData( domainProps );
	return render( <DomainOverviewSettings domain={ mockDomain } domainDiagnostics={ undefined } /> );
}

describe( 'DomainOverviewSettings', () => {
	describe( 'Registered Domain Tests', () => {
		test( 'shows all settings for fully manageable registered domain', async () => {
			renderDomainSettings( {
				subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Domain Registration' },
				current_user_can_manage: true,
				can_manage_dns_records: true,
				expired: false,
				pending_transfer: false,
				is_gravatar_restricted_domain: false,
				transfer_status: null,
			} );

			await waitFor( () => {
				expect( screen.getByText( 'Settings' ) ).toBeInTheDocument();
			} );

			// Should show all 5 settings buttons
			expect( screen.getByText( 'Name servers' ) ).toBeInTheDocument();
			expect( screen.getByText( 'DNS records' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Domain forwarding' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Contact details & privacy' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Domain security' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Glue records' ) ).toBeInTheDocument();
		} );

		test( 'hides name servers setting for gravatar restricted domain', async () => {
			renderDomainSettings( {
				subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Domain Registration' },
				is_gravatar_restricted_domain: true,
				current_user_can_manage: true,
				can_manage_dns_records: true,
				expired: false,
				pending_transfer: false,
			} );

			await waitFor( () => {
				expect( screen.getByText( 'Settings' ) ).toBeInTheDocument();
			} );

			// Should not show name servers
			expect( screen.queryByText( 'Name servers' ) ).not.toBeInTheDocument();

			// Should show other settings
			expect( screen.getByText( 'DNS records' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Domain forwarding' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Contact details & privacy' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Domain security' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Glue records' ) ).toBeInTheDocument();
		} );

		test( 'hides DNS-related settings when cannot manage DNS records', async () => {
			renderDomainSettings( {
				subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Domain Registration' },
				can_manage_dns_records: false,
				current_user_can_manage: true,
				expired: false,
				pending_transfer: false,
				is_gravatar_restricted_domain: false,
			} );

			await waitFor( () => {
				expect( screen.getByText( 'Settings' ) ).toBeInTheDocument();
			} );

			// Should show name servers (not affected by can_manage_dns_records)
			expect( screen.getByText( 'Name servers' ) ).toBeInTheDocument();

			// Should not show DNS records, email forwarding, or glue records
			expect( screen.queryByText( 'DNS records' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Domain forwarding' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Glue records' ) ).not.toBeInTheDocument();

			// Should show contact information and security
			expect( screen.getByText( 'Contact details & privacy' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Domain security' ) ).toBeInTheDocument();
		} );

		test( 'hides contact details when user cannot manage', async () => {
			renderDomainSettings( {
				subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Domain Registration' },
				current_user_can_manage: false,
				can_manage_dns_records: true,
				expired: false,
				pending_transfer: false,
				is_gravatar_restricted_domain: false,
			} );

			await waitFor( () => {
				expect( screen.getByText( 'Settings' ) ).toBeInTheDocument();
			} );

			// Should show DNS-related settings
			expect( screen.getByText( 'Name servers' ) ).toBeInTheDocument();
			expect( screen.getByText( 'DNS records' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Domain forwarding' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Domain security' ) ).toBeInTheDocument();

			// Should not show contact details or glue records
			expect( screen.queryByText( 'Contact details & privacy' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Glue records' ) ).not.toBeInTheDocument();
		} );

		test( 'hides contact details for expired domain', async () => {
			renderDomainSettings( {
				subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Domain Registration' },
				current_user_can_manage: true,
				can_manage_dns_records: true,
				expired: true,
				pending_transfer: false,
				is_gravatar_restricted_domain: false,
			} );

			await waitFor( () => {
				expect( screen.getByText( 'Settings' ) ).toBeInTheDocument();
			} );

			// Should show other settings
			expect( screen.getByText( 'Name servers' ) ).toBeInTheDocument();
			expect( screen.getByText( 'DNS records' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Domain forwarding' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Domain security' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Glue records' ) ).toBeInTheDocument();

			// Should not show contact details for expired domain
			expect( screen.queryByText( 'Contact details & privacy' ) ).not.toBeInTheDocument();
		} );

		test( 'hides contact details for pending transfer domain', async () => {
			renderDomainSettings( {
				subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Domain Registration' },
				current_user_can_manage: true,
				can_manage_dns_records: true,
				expired: false,
				pending_transfer: true,
				is_gravatar_restricted_domain: false,
			} );

			await waitFor( () => {
				expect( screen.getByText( 'Settings' ) ).toBeInTheDocument();
			} );

			// Should show other settings
			expect( screen.getByText( 'Name servers' ) ).toBeInTheDocument();
			expect( screen.getByText( 'DNS records' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Domain forwarding' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Domain security' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Glue records' ) ).toBeInTheDocument();

			// Should not show contact details for pending transfer
			expect( screen.queryByText( 'Contact details & privacy' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'Connected Domain Tests', () => {
		test( 'shows limited settings for basic connected domain', async () => {
			renderDomainSettings( {
				subtype: { id: DomainSubtype.DOMAIN_CONNECTION, label: 'Domain Connection' },
				current_user_can_manage: true,
				can_manage_dns_records: true,
				transfer_status: null,
			} );

			await waitFor( () => {
				expect( screen.getByText( 'Settings' ) ).toBeInTheDocument();
			} );

			// Should show DNS records, email forwarding, and security
			expect( screen.getByText( 'DNS records' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Domain forwarding' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Domain security' ) ).toBeInTheDocument();

			// Should not show name servers, contact details, or glue records
			expect( screen.queryByText( 'Name servers' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Contact details & privacy' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Glue records' ) ).not.toBeInTheDocument();
		} );

		test( 'hides DNS settings when connected domain cannot manage DNS', async () => {
			renderDomainSettings( {
				subtype: { id: DomainSubtype.DOMAIN_CONNECTION, label: 'Domain Connection' },
				can_manage_dns_records: false,
				transfer_status: null,
			} );

			await waitFor( () => {
				expect( screen.getByText( 'Settings' ) ).toBeInTheDocument();
			} );

			// Should show only security
			expect( screen.getByText( 'Domain security' ) ).toBeInTheDocument();

			// Should not show DNS records or email forwarding
			expect( screen.queryByText( 'DNS records' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Domain forwarding' ) ).not.toBeInTheDocument();

			// Should not show registration-only settings
			expect( screen.queryByText( 'Name servers' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Contact details & privacy' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Glue records' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'Edge Cases', () => {
		test( 'shows correct number of settings for partially restricted registered domain', async () => {
			renderDomainSettings( {
				subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Domain Registration' },
				current_user_can_manage: false, // Restricts contact details and glue records
				can_manage_dns_records: false, // Restricts DNS records, email forwarding, and glue records
				is_gravatar_restricted_domain: true, // Restricts name servers
			} );

			await waitFor( () => {
				expect( screen.getByText( 'Settings' ) ).toBeInTheDocument();
			} );

			// Should only show security setting
			expect( screen.getByText( 'Domain security' ) ).toBeInTheDocument();

			// Should not show any other settings
			expect( screen.queryByText( 'Name servers' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'DNS records' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Domain forwarding' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Contact details & privacy' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Glue records' ) ).not.toBeInTheDocument();

			// Verify only 1 setting button exists
			const settingsButtons = screen.getAllByRole( 'link' );
			expect( settingsButtons ).toHaveLength( 1 );
		} );
	} );
} );
