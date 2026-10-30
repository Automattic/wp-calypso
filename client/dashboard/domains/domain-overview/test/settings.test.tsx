/**
 * @jest-environment jsdom
 */
import { DomainSubtype, DomainTransferStatus, type Domain } from '@automattic/api-core';
import { isSupportSession } from '@automattic/calypso-support-session';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import DomainOverviewSettings from '../settings';

jest.mock( '@automattic/calypso-support-session', () => ( {
	isSupportSession: jest.fn( () => false ),
} ) );

afterEach( () => {
	( isSupportSession as jest.Mock ).mockReturnValue( false );
} );

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
		pending_registration_at_registry_url: '',
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

async function showAdvancedSettings() {
	await userEvent.click( await screen.findByRole( 'button', { name: 'Show advanced settings' } ) );
}

describe( 'DomainOverviewSettings', () => {
	describe( 'Registered Domain Tests', () => {
		test( 'shows everyday settings and hides technical settings by default', async () => {
			renderDomainSettings();

			expect( await screen.findByText( 'Settings' ) ).toBeVisible();
			expect( screen.getByText( 'Site' ) ).toBeVisible();
			expect( screen.getByText( 'Professional email' ) ).toBeVisible();
			expect( screen.getByText( 'Domain forwarding' ) ).toBeVisible();
			expect( screen.getByText( 'Name servers' ) ).toBeVisible();
			expect( screen.getByText( 'DNS records' ) ).toBeVisible();

			expect( screen.queryByText( 'Domain security' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Glue records' ) ).not.toBeInTheDocument();
			// Lives in the Registration section.
			expect( screen.queryByText( 'Contact details & privacy' ) ).not.toBeInTheDocument();
		} );

		test( 'toggles the technical settings', async () => {
			renderDomainSettings();

			await showAdvancedSettings();

			expect( screen.getByText( 'Domain security' ) ).toBeVisible();
			expect( screen.getByText( 'Glue records' ) ).toBeVisible();

			const hideButton = screen.getByRole( 'button', { name: 'Hide advanced settings' } );
			expect( hideButton ).toHaveAttribute( 'aria-expanded', 'true' );

			await userEvent.click( hideButton );

			expect( screen.queryByText( 'Domain security' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Glue records' ) ).not.toBeInTheDocument();
		} );

		test( 'hides name servers setting for gravatar restricted domain', async () => {
			renderDomainSettings( { is_gravatar_restricted_domain: true } );

			expect( await screen.findByText( 'DNS records' ) ).toBeVisible();
			expect( screen.queryByText( 'Name servers' ) ).not.toBeInTheDocument();
		} );

		test( 'hides DNS-related settings when cannot manage DNS records', async () => {
			renderDomainSettings( { can_manage_dns_records: false } );

			await showAdvancedSettings();

			expect( screen.getByText( 'Name servers' ) ).toBeVisible();
			expect( screen.getByText( 'Domain security' ) ).toBeVisible();
			expect( screen.queryByText( 'DNS records' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Domain forwarding' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Glue records' ) ).not.toBeInTheDocument();
		} );

		test( 'hides glue records when user cannot manage', async () => {
			renderDomainSettings( { current_user_can_manage: false } );

			await showAdvancedSettings();

			expect( screen.getByText( 'Domain security' ) ).toBeVisible();
			expect( screen.queryByText( 'Glue records' ) ).not.toBeInTheDocument();
		} );

		test( 'shows glue records in a support session even when user cannot manage', async () => {
			( isSupportSession as jest.Mock ).mockReturnValue( true );
			renderDomainSettings( { current_user_can_manage: false } );

			await showAdvancedSettings();

			expect( screen.getByText( 'Glue records' ) ).toBeVisible();
		} );
	} );

	describe( 'Connected Domain Tests', () => {
		test( 'shows limited settings for basic connected domain', async () => {
			renderDomainSettings( {
				subtype: { id: DomainSubtype.DOMAIN_CONNECTION, label: 'Domain Connection' },
			} );

			await showAdvancedSettings();

			expect( screen.getByText( 'DNS records' ) ).toBeVisible();
			expect( screen.getByText( 'Domain forwarding' ) ).toBeVisible();
			expect( screen.getByText( 'Domain security' ) ).toBeVisible();
			expect( screen.queryByText( 'Name servers' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Glue records' ) ).not.toBeInTheDocument();
		} );

		test( 'hides DNS settings when connected domain cannot manage DNS', async () => {
			renderDomainSettings( {
				subtype: { id: DomainSubtype.DOMAIN_CONNECTION, label: 'Domain Connection' },
				can_manage_dns_records: false,
			} );

			await showAdvancedSettings();

			expect( screen.getByText( 'Domain security' ) ).toBeVisible();
			expect( screen.queryByText( 'DNS records' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Domain forwarding' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'Edge Cases', () => {
		test( 'does not offer advanced settings when there are none', async () => {
			renderDomainSettings( {
				subtype: { id: DomainSubtype.DOMAIN_TRANSFER, label: 'Domain Transfer' },
				transfer_status: DomainTransferStatus.PENDING_ASYNC,
			} );

			expect( await screen.findByText( 'Site' ) ).toBeVisible();
			expect(
				screen.queryByRole( 'button', { name: 'Show advanced settings' } )
			).not.toBeInTheDocument();
		} );
	} );
} );
