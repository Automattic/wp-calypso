/**
 * @jest-environment jsdom
 */
import { DomainSubtype, type Domain, type Site } from '@automattic/api-core';
import { siteByIdQuery } from '@automattic/api-queries';
import { isSupportSession } from '@automattic/calypso-support-session';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
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

const getMockedSiteData = ( customProps: Partial< Site > = {} ): Site =>
	( {
		ID: 123,
		URL: `https://${ domainName }`,
		is_wpcom_atomic: false,
		...customProps,
	} ) as Site;

function renderDomainSettings(
	domainProps: Partial< Domain > = {},
	siteProps: Partial< Site > = {}
) {
	const mockDomain = getMockedDomainData( domainProps );
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	queryClient.setQueryData(
		siteByIdQuery( mockDomain.blog_id ).queryKey,
		getMockedSiteData( siteProps )
	);
	return render( <DomainOverviewSettings domain={ mockDomain } domainDiagnostics={ undefined } />, {
		queryClient,
	} );
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

		test( 'shows contact details and glue records in a support session even when user cannot manage', async () => {
			( isSupportSession as jest.Mock ).mockReturnValue( true );

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

			expect( screen.getByText( 'Contact details & privacy' ) ).toBeVisible();
			expect( screen.getByText( 'Glue records' ) ).toBeVisible();
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

	describe( 'Web address', () => {
		const eligibleDomain: Partial< Domain > = {
			primary_domain: true,
			primary_is_www: false,
		};
		const atomicSite: Partial< Site > = { is_wpcom_atomic: true };

		const interceptWwwPrimary = ( enabled: boolean ) =>
			nock( 'https://public-api.wordpress.com' )
				.post( `/wpcom/v2/domains/www-primary/${ domainName }`, { enabled } )
				.reply( 200, { enabled, primary_domain: domainName } );

		test( 'is hidden for a Simple site', async () => {
			renderDomainSettings( eligibleDomain );

			await waitFor( () => {
				expect( screen.getByText( 'Settings' ) ).toBeInTheDocument();
			} );
			expect( screen.queryByText( 'Web address' ) ).not.toBeInTheDocument();
		} );

		test( 'is hidden for a domain that is not the primary domain', async () => {
			renderDomainSettings( { ...eligibleDomain, primary_domain: false }, atomicSite );

			await waitFor( () => {
				expect( screen.getByText( 'Settings' ) ).toBeInTheDocument();
			} );
			expect( screen.queryByText( 'Web address' ) ).not.toBeInTheDocument();
		} );

		test( 'is hidden for the default site address', async () => {
			renderDomainSettings(
				{
					...eligibleDomain,
					subtype: { id: DomainSubtype.DEFAULT_ADDRESS, label: 'Default address' },
				},
				atomicSite
			);

			expect( screen.queryByText( 'Web address' ) ).not.toBeInTheDocument();
		} );

		test( 'is shown for the primary domain of an Atomic site', async () => {
			renderDomainSettings( eligibleDomain, atomicSite );

			expect( await screen.findByText( 'Web address' ) ).toBeInTheDocument();
			expect( screen.getByRole( 'radio', { name: domainName } ) ).toBeChecked();
			expect( screen.getByRole( 'radio', { name: `www.${ domainName }` } ) ).not.toBeChecked();
			expect(
				screen.getByText(
					'Pick this if people already know your site at the www address, for example after moving it here from another host.'
				)
			).toBeInTheDocument();
		} );

		test( 'falls back to the site address when the domain does not report the www state', async () => {
			renderDomainSettings(
				{ ...eligibleDomain, primary_is_www: undefined },
				{ ...atomicSite, URL: `https://www.${ domainName }` }
			);

			expect( await screen.findByRole( 'radio', { name: `www.${ domainName }` } ) ).toBeChecked();
		} );

		test( 'switches to the www address and records a Tracks event', async () => {
			const user = userEvent.setup();
			const scope = interceptWwwPrimary( true );
			const { recordTracksEvent } = renderDomainSettings( eligibleDomain, atomicSite );

			await user.click( await screen.findByRole( 'radio', { name: `www.${ domainName }` } ) );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_dashboard_domain_settings_web_address_change',
				{ domain: domainName, www: true }
			);
			await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		} );

		test( 'switches back to the root domain', async () => {
			const user = userEvent.setup();
			const scope = interceptWwwPrimary( false );
			const { recordTracksEvent } = renderDomainSettings(
				{ ...eligibleDomain, primary_is_www: true },
				atomicSite
			);

			await user.click( await screen.findByRole( 'radio', { name: domainName } ) );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_dashboard_domain_settings_web_address_change',
				{ domain: domainName, www: false }
			);
			await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		} );
	} );
} );
