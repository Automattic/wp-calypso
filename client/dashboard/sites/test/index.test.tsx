/**
 * @jest-environment jsdom
 */

import { startSiteCollisionListener } from '@automattic/api-queries';
import { screen, waitFor, within } from '@testing-library/react';
import nock from 'nock';
import { APP_CONTEXT_DEFAULT_CONFIG } from '../../app/context';
import { render } from '../../test-utils';
import { getDefaultView } from '../dataviews';
import Sites from '../index';
import type { AppConfig } from '../../app/context';
import type { Site, User } from '@automattic/api-core';

// The account-email-bouncing notice only renders where the dashboard variant supports /me.
const configWithMeSupport: AppConfig = {
	...APP_CONTEXT_DEFAULT_CONFIG,
	supports: {
		...APP_CONTEXT_DEFAULT_CONFIG.supports,
		me: { billing: { monetizeSubscriptions: true }, security: { sshKey: true }, apps: true },
	},
};

const mockSites = [
	{
		ID: 1,
		name: 'My First Site',
		slug: 'my-first-site.wordpress.com',
		URL: 'https://my-first-site.wordpress.com',
		is_coming_soon: false,
		is_private: false,
		site_migration: {},
		plan: { product_slug: 'business-bundle', product_name_short: 'Business' },
	} as Site,
	{
		ID: 2,
		name: 'My Second Site',
		slug: 'my-second-site.wordpress.com',
		URL: 'https://my-second-site.wordpress.com',
		is_coming_soon: true,
		is_private: false,
		site_migration: {},
		plan: { product_slug: 'free_plan', product_name_short: 'Free' },
	} as Site,
];

function mockSitesEndpoint( sites: Site[] ) {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.3/me/sites' )
		.query( true )
		.reply( 200, { sites, total: sites.length } );
}

const BOUNCING_NOTICE_TITLE = 'Your account email isn’t receiving our messages';
const RECOVERY_MATCH_NOTICE_TITLE = 'Your recovery email is the same as your account email';

// Register before mockSitesEndpoint so the catch-all interceptor doesn't
// consume the deleted-sites check request.
function mockDeletedSitesCheckEndpoint( total: number ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.3/me/sites' )
		.query( ( query ) => query.site_visibility === 'deleted' )
		.reply( 200, { sites: [], total } );
}

describe( '<Sites>', () => {
	beforeEach( () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/read/teams' )
			.query( true )
			.reply( 200, { teams: [] } );

		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( '/rest/v1.1/me/preferences' )
			.query( true )
			.reply( 200, { calypso_preferences: {} } );
	} );

	afterEach( () => {
		window.history.replaceState( null, '', '/' );
	} );

	test( 'applies the deleted-sites filter from the URL query params', async () => {
		window.history.replaceState( null, '', '/?is_deleted=true' );

		const deletedSitesRequest = nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.3/me/sites' )
			.query( ( q ) => q.site_visibility === 'deleted' )
			.reply( 200, {
				sites: [
					{
						...mockSites[ 0 ],
						ID: 99,
						name: 'My Deleted Site',
						slug: 'my-deleted-site.wordpress.com',
						URL: 'https://my-deleted-site.wordpress.com',
						is_deleted: true,
					} as Site,
				],
				total: 1,
			} );
		mockSitesEndpoint( mockSites );

		render( <Sites />, {
			user: {
				site_count: mockSites.length,
			} as User,
		} );

		expect( await screen.findByText( 'My Deleted Site' ) ).toBeVisible();
		expect( deletedSitesRequest.isDone() ).toBe( true );
		expect( screen.queryByText( 'My First Site' ) ).not.toBeInTheDocument();
	} );

	test( 'renders Add new site button', async () => {
		mockSitesEndpoint( mockSites );
		render( <Sites />, {
			user: {
				site_count: mockSites.length,
			} as User,
		} );

		expect( await screen.findByRole( 'button', { name: 'Add new site' } ) ).toBeVisible();
	} );

	test( 'shows the bouncing-email notice at the top of the sites list', async () => {
		mockSitesEndpoint( mockSites );

		render( <Sites />, {
			user: {
				site_count: mockSites.length,
				email_bouncing: true,
			} as User,
			config: configWithMeSupport,
		} );

		expect( await screen.findByText( BOUNCING_NOTICE_TITLE ) ).toBeVisible();
	} );

	test( 'hides the bouncing-email notice when the account email is fine', async () => {
		mockSitesEndpoint( mockSites );

		render( <Sites />, {
			user: {
				site_count: mockSites.length,
			} as User,
			config: configWithMeSupport,
		} );

		await screen.findByRole( 'button', { name: 'Add new site' } );
		expect( screen.queryByText( BOUNCING_NOTICE_TITLE ) ).not.toBeInTheDocument();
	} );

	test( 'hides the bouncing-email notice in variants without /me support', async () => {
		mockSitesEndpoint( mockSites );

		render( <Sites />, {
			user: {
				site_count: mockSites.length,
				email_bouncing: true,
			} as User,
		} );

		await screen.findByRole( 'button', { name: 'Add new site' } );
		expect( screen.queryByText( BOUNCING_NOTICE_TITLE ) ).not.toBeInTheDocument();
	} );

	test( 'shows the recovery-email-matches-account-email notice at the top of the sites list', async () => {
		mockSitesEndpoint( mockSites );

		render( <Sites />, {
			user: {
				site_count: mockSites.length,
				recovery_email_matches_account_email: true,
			} as User,
			config: configWithMeSupport,
		} );

		expect( await screen.findByText( RECOVERY_MATCH_NOTICE_TITLE ) ).toBeVisible();
	} );

	test( 'hides the recovery-email-matches-account-email notice when the recovery email is a different address', async () => {
		mockSitesEndpoint( mockSites );

		render( <Sites />, {
			user: {
				site_count: mockSites.length,
			} as User,
			config: configWithMeSupport,
		} );

		await screen.findByRole( 'button', { name: 'Add new site' } );
		expect( screen.queryByText( RECOVERY_MATCH_NOTICE_TITLE ) ).not.toBeInTheDocument();
	} );

	test( 'hides the recovery-email-matches-account-email notice in variants without /me support', async () => {
		mockSitesEndpoint( mockSites );

		render( <Sites />, {
			user: {
				site_count: mockSites.length,
				recovery_email_matches_account_email: true,
			} as User,
		} );

		await screen.findByRole( 'button', { name: 'Add new site' } );
		expect( screen.queryByText( RECOVERY_MATCH_NOTICE_TITLE ) ).not.toBeInTheDocument();
	} );

	// The arbiter shows one notice at a time, and an account email nothing reaches is the worse
	// of the two problems.
	test( 'shows the bouncing-email notice instead when both apply', async () => {
		mockSitesEndpoint( mockSites );

		render( <Sites />, {
			user: {
				site_count: mockSites.length,
				email_bouncing: true,
				recovery_email_matches_account_email: true,
			} as User,
			config: configWithMeSupport,
		} );

		expect( await screen.findByText( BOUNCING_NOTICE_TITLE ) ).toBeVisible();
		expect( screen.queryByText( RECOVERY_MATCH_NOTICE_TITLE ) ).not.toBeInTheDocument();
	} );

	test( 'renders empty state when the user has no sites', async () => {
		mockDeletedSitesCheckEndpoint( 0 );
		mockSitesEndpoint( mockSites );
		render( <Sites />, {
			user: {
				site_count: 0,
			} as User,
		} );

		expect(
			await screen.findByRole( 'heading', { name: /You don.t have any sites yet/ } )
		).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Create a site' } ) ).toBeVisible();
		expect( screen.queryByRole( 'table' ) ).not.toBeInTheDocument();
	} );

	test( 'renders the deleted-aware empty state when a zero-site user has deleted sites', async () => {
		mockDeletedSitesCheckEndpoint( 1 );
		mockSitesEndpoint( [] );
		render( <Sites />, {
			user: {
				site_count: 0,
			} as User,
		} );

		expect(
			await screen.findByRole( 'heading', { name: /You don.t have any active sites/ } )
		).toBeVisible();
		const link = screen.getByRole( 'link', { name: 'Show deleted sites' } );
		expect( link ).toBeVisible();
		expect( link ).toHaveAttribute( 'href', expect.stringContaining( 'is_deleted=true' ) );
		expect( screen.getByRole( 'link', { name: 'Create a site' } ) ).toBeVisible();
	} );

	test( 'renders the onboarding empty state when a zero-site user has no deleted sites', async () => {
		const deletedCheckScope = mockDeletedSitesCheckEndpoint( 0 );
		mockSitesEndpoint( [] );
		render( <Sites />, {
			user: {
				site_count: 0,
			} as User,
		} );

		expect(
			await screen.findByRole( 'heading', { name: /You don.t have any sites yet/ } )
		).toBeVisible();
		await waitFor( () => expect( deletedCheckScope.isDone() ).toBe( true ) );
		expect( screen.queryByRole( 'link', { name: 'Show deleted sites' } ) ).not.toBeInTheDocument();
	} );

	test( 'falls back to the onboarding empty state when the deleted-sites check fails', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.3/me/sites' )
			.query( ( query ) => query.site_visibility === 'deleted' )
			.reply( 403, { error: 'unauthorized' } );
		mockSitesEndpoint( [] );
		render( <Sites />, {
			user: {
				site_count: 0,
			} as User,
		} );

		expect(
			await screen.findByRole( 'heading', { name: /You don.t have any sites yet/ } )
		).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'Show deleted sites' } ) ).not.toBeInTheDocument();
	} );

	test( 'does not flash the onboarding empty state while the deleted-sites check is pending', async () => {
		let resolveDeletedCheck: ( () => void ) | null = null;
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.3/me/sites' )
			.query( ( query ) => query.site_visibility === 'deleted' )
			.reply(
				200,
				() =>
					new Promise( ( resolve ) => {
						resolveDeletedCheck = () => resolve( { sites: [], total: 1 } );
					} )
			);
		mockSitesEndpoint( [] );
		render( <Sites />, {
			user: {
				site_count: 0,
			} as User,
		} );

		await screen.findByRole( 'heading', { name: 'Sites' } );
		await waitFor( () => expect( resolveDeletedCheck ).not.toBeNull() );
		expect(
			screen.queryByRole( 'heading', { name: /You don.t have any sites yet/ } )
		).not.toBeInTheDocument();

		resolveDeletedCheck!();
		expect(
			await screen.findByRole( 'heading', { name: /You don.t have any active sites/ } )
		).toBeVisible();
	} );

	test( 'lists deleted sites alongside live ones when the deleted filter is on', async () => {
		nock.cleanAll();
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/read/teams' )
			.query( true )
			.reply( 200, { teams: [] } );
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( '/rest/v1.1/me/preferences' )
			.query( true )
			.reply( 200, {
				calypso_preferences: {
					'hosting-dashboard-dataviews-view-sites': {
						type: 'table',
						perPage: 12,
						fields: [ 'visibility', 'plan' ],
						sort: { field: 'name', direction: 'asc' },
						titleField: 'name',
						mediaField: 'icon.ico',
						descriptionField: 'URL',
						showTitle: true,
						showMedia: true,
						showDescription: true,
						filters: [ { field: 'is_deleted', operator: 'is', value: true } ],
					},
				},
			} );

		const deletedSite = { ...mockSites[ 1 ], ID: 3, name: 'My Deleted Site', is_deleted: true };
		// Only a request that widens visibility returns both; a deleted-only
		// request returns just the deleted site.
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.3/me/sites' )
			.query( ( query ) => query.site_visibility === 'all' )
			.reply( 200, { sites: [ mockSites[ 0 ], deletedSite ], total: 2 } );
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.3/me/sites' )
			.query( true )
			.reply( 200, { sites: [ deletedSite ], total: 1 } );

		render( <Sites />, { user: { site_count: 2 } as User } );

		expect( await screen.findByText( 'My Deleted Site' ) ).toBeVisible();
		expect( screen.getByText( 'My First Site' ) ).toBeVisible();
	} );

	test( 'collision listener rewrites wpcom site slug when it collides with a Jetpack site', async () => {
		mockSitesEndpoint( [
			{
				ID: 10,
				name: 'Jetpack Site',
				slug: 'shared-domain.com',
				URL: 'https://shared-domain.com',
				jetpack: true,
				is_coming_soon: false,
				is_private: false,
				site_migration: {},
				capabilities: { manage_options: true },
				plan: {
					product_slug: 'jetpack_free',
					product_name_short: 'Jetpack Free',
					features: { active: [] },
				},
			} as unknown as Site,
			{
				ID: 20,
				name: 'WPcom Site',
				slug: 'shared-domain.com',
				URL: 'https://shared-domain.com',
				jetpack: false,
				is_coming_soon: false,
				is_private: false,
				site_migration: {},
				capabilities: { manage_options: true },
				options: { unmapped_url: 'https://wpcomsite.wordpress.com' },
				plan: {
					product_slug: 'business-bundle',
					product_name_short: 'Business',
					features: { active: [] },
				},
			} as unknown as Site,
		] );

		const { queryClient } = render( <Sites />, {
			user: {
				site_count: 13, // more than 12 sites to force the table layout
			} as User,
		} );
		startSiteCollisionListener( queryClient );

		// Slug rewrite is async; poll until it lands. Re-query the table each pass
		// to avoid a stale node after a re-render.
		await waitFor( () => {
			const links = within( screen.getByRole( 'table' ) ).getAllByRole( 'link', {
				name: /WPcom Site/,
			} );
			for ( const link of links ) {
				expect( link ).toHaveAttribute(
					'href',
					expect.stringMatching( /\/sites\/wpcomsite\.wordpress\.com$/ )
				);
			}
		} );

		// The Jetpack site's links are never rewritten; the table is settled now.
		const jpLinks = within( screen.getByRole( 'table' ) ).getAllByRole( 'link', {
			name: /Jetpack Site/,
		} );
		for ( const jpLink of jpLinks ) {
			expect( jpLink ).toHaveAttribute(
				'href',
				expect.stringMatching( /\/sites\/shared-domain\.com$/ )
			);
		}
	} );

	test( 'renders DataViews when the user has sites', async () => {
		mockSitesEndpoint( mockSites );
		render( <Sites />, {
			user: {
				site_count: 13, // more than 12 sites to force the table layout
			} as User,
		} );

		const table = await screen.findByRole( 'table' );
		await waitFor( () => expect( within( table ).getAllByRole( 'row' ) ).toHaveLength( 3 ) );

		const rows = within( table ).getAllByRole( 'row' );

		const header = within( rows[ 0 ] ).getAllByRole( 'columnheader' );
		expect( header[ 0 ] ).toHaveTextContent( 'Site' );
		expect( header[ 1 ] ).toHaveTextContent( 'Visibility' );
		expect( header[ 2 ] ).toHaveTextContent( 'Plan' );

		const row1 = within( rows[ 1 ] ).getAllByRole( 'cell' );
		expect( row1[ 0 ] ).toHaveTextContent( 'My First Site' );
		expect( row1[ 0 ] ).toHaveTextContent( 'my-first-site.wordpress.com' );
		expect( row1[ 1 ] ).toHaveTextContent( 'Public' );
		expect( row1[ 2 ] ).toHaveTextContent( 'Business' );

		const row2 = within( rows[ 2 ] ).getAllByRole( 'cell' );
		expect( row2[ 0 ] ).toHaveTextContent( 'My Second Site' );
		expect( row2[ 0 ] ).toHaveTextContent( 'my-second-site.wordpress.com' );
		expect( row2[ 1 ] ).toHaveTextContent( 'Coming soon' );
		expect( row2[ 2 ] ).toHaveTextContent( 'Free' );
	} );

	describe( 'staging filter', () => {
		const stagingSite = {
			ID: 3,
			name: 'My Staging Site',
			slug: 'my-staging-site.wpcomstaging.com',
			URL: 'https://my-staging-site.wpcomstaging.com',
			is_wpcom_staging_site: true,
			is_coming_soon: false,
			is_private: false,
			site_migration: {},
			plan: { product_slug: 'business-bundle', product_name_short: 'Business' },
		} as Site;

		function mockSitesEndpointByStagingParam() {
			nock( 'https://public-api.wordpress.com' )
				.get( '/rest/v1.3/me/sites' )
				.query( ( query ) => query.include_staging === 'false' )
				.reply( 200, { sites: mockSites, total: mockSites.length } );
			nock( 'https://public-api.wordpress.com' )
				.get( '/rest/v1.3/me/sites' )
				.query( ( query ) => query.include_staging === 'true' )
				.reply( 200, { sites: [ ...mockSites, stagingSite ], total: mockSites.length + 1 } );
		}

		test( 'excludes staging sites by default', async () => {
			mockSitesEndpointByStagingParam();
			render( <Sites />, { user: { site_count: 13 } as User } );

			expect( await screen.findByText( 'My First Site' ) ).toBeVisible();
			expect( screen.queryByText( 'My Staging Site' ) ).not.toBeInTheDocument();
		} );

		test( 'includes staging sites when the staging filter is set to show', async () => {
			// The persisted view comes from user preferences, which the shared mock returns empty.
			nock.cleanAll();
			nock( 'https://public-api.wordpress.com' )
				.get( '/rest/v1.2/read/teams' )
				.query( true )
				.reply( 200, { teams: [] } );
			nock( 'https://public-api.wordpress.com' )
				.persist()
				.get( '/rest/v1.1/me/preferences' )
				.query( true )
				.reply( 200, {
					calypso_preferences: {
						'hosting-dashboard-dataviews-view-sites': {
							...getDefaultView( {
								siteCount: 13,
								isAutomattician: false,
								isRestoringAccount: false,
							} ),
							filters: [ { field: 'staging', operator: 'is', value: true } ],
						},
					},
				} );
			mockSitesEndpointByStagingParam();
			render( <Sites />, { user: { site_count: 13 } as User } );

			expect( await screen.findByText( 'My Staging Site' ) ).toBeVisible();
		} );
	} );
} );
