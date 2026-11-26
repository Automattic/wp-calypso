/**
 * @vitest-environment jsdom
 */

import { startSiteCollisionListener } from '@automattic/api-queries';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import Sites from '..';
import { APP_CONTEXT_DEFAULT_CONFIG } from '../../../../app/context';
import { render } from '../../../../test-utils';
import type { AppConfig } from '../../../../app/context';
import type { Site, User } from '@automattic/api-core';

const sites = [
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

function mockSites() {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.3/me/sites' )
		.query( true )
		.reply( 200, { sites, total: sites.length } );
}

function mockPreferences( preferences: Record< string, unknown > = {} ) {
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: preferences } );
}

describe( '<Sites>', () => {
	beforeEach( () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/read/teams' )
			.query( true )
			.reply( 200, { teams: [] } );
	} );

	describe( 'header', () => {
		beforeEach( () => {
			mockPreferences();
		} );

		test( 'shows the add new site button', async () => {
			mockSites();

			render( <Sites />, { user: { site_count: sites.length } as User } );

			expect( await screen.findByRole( 'button', { name: 'Add new site' } ) ).toBeVisible();
		} );
	} );

	describe( 'notices', () => {
		beforeEach( () => {
			mockSites();
		} );

		const configWithMeSupport: AppConfig = {
			...APP_CONTEXT_DEFAULT_CONFIG,
			supports: {
				...APP_CONTEXT_DEFAULT_CONFIG.supports,
				me: { billing: { monetizeSubscriptions: true }, security: { sshKey: true }, apps: true },
			},
		};

		test( 'shows the security key notice when the key needs to be re-registered', async () => {
			mockPreferences( { two_step_security_key_reregister_required: true } );

			render( <Sites />, {
				user: { site_count: sites.length } as User,
				config: configWithMeSupport,
			} );

			expect( await screen.findByText( 'Your security key needs to be replaced' ) ).toBeVisible();
		} );

		test( 'shows the account email bouncing notice when the account email is bouncing', async () => {
			mockPreferences();

			render( <Sites />, {
				user: { site_count: sites.length, email_bouncing: true } as User,
				config: configWithMeSupport,
			} );

			expect(
				await screen.findByText( 'Your account email isn’t receiving our messages' )
			).toBeVisible();
		} );

		test( 'shows the recovery email notice when the recovery email matches the account email', async () => {
			mockPreferences();

			render( <Sites />, {
				user: { site_count: sites.length, recovery_email_matches_account_email: true } as User,
				config: configWithMeSupport,
			} );

			expect(
				await screen.findByText( 'Your recovery email is the same as your account email' )
			).toBeVisible();
		} );
	} );

	describe( 'site list', () => {
		beforeEach( () => {
			mockPreferences();
		} );

		test( 'lists sites', async () => {
			mockSites();

			render( <Sites />, { user: { site_count: 2 } as User } );

			expect( await screen.findByText( 'My First Site' ) ).toBeVisible();
			expect( screen.getByText( 'My Second Site' ) ).toBeVisible();
		} );

		test( 'requests deleted sites as well when the is_deleted query param is set', async () => {
			const deletedSite = { ...sites[ 1 ], ID: 3, name: 'My Deleted Site', is_deleted: true };
			nock( 'https://public-api.wordpress.com' )
				.get( '/rest/v1.3/me/sites' )
				.query( ( query ) => query.site_visibility === 'all' )
				.reply( 200, { sites: [ sites[ 0 ], deletedSite ], total: 2 } );

			render( <Sites search={ { is_deleted: true } } />, { user: { site_count: 2 } as User } );

			expect( await screen.findByText( 'My Deleted Site' ) ).toBeVisible();
			expect( screen.getByText( 'My First Site' ) ).toBeVisible();
		} );

		test( 'requests hidden sites as well when the restored query param is set', async () => {
			const hiddenSite = { ...sites[ 1 ], ID: 3, name: 'My Hidden Site' };
			nock( 'https://public-api.wordpress.com' )
				.get( '/rest/v1.3/me/sites' )
				.query( ( query ) => query.site_visibility === 'all' )
				.reply( 200, { sites: [ sites[ 0 ], hiddenSite ], total: 2 } );

			render( <Sites search={ { restored: 1 } } />, { user: { site_count: 2 } as User } );

			expect( await screen.findByText( 'My Hidden Site' ) ).toBeVisible();
		} );

		test( 'links a WordPress.com site by its unmapped address when a Jetpack site shares its domain', async () => {
			nock( 'https://public-api.wordpress.com' )
				.get( '/rest/v1.3/me/sites' )
				.query( true )
				.reply( 200, {
					sites: [
						{
							ID: 10,
							name: 'Jetpack Site',
							slug: 'shared-domain.com',
							URL: 'https://shared-domain.com',
							jetpack: true,
							site_migration: {},
							capabilities: { manage_options: true },
						},
						{
							ID: 20,
							name: 'WordPress.com Site',
							slug: 'shared-domain.com',
							URL: 'https://shared-domain.com',
							site_migration: {},
							capabilities: { manage_options: true },
							options: { unmapped_url: 'https://wpcomsite.wordpress.com' },
						},
					],
				} );

			const { queryClient } = render( <Sites />, {
				user: { site_count: 2 } as User,
			} );

			startSiteCollisionListener( queryClient );

			await waitFor( () => {
				for ( const link of screen.getAllByRole( 'link', { name: /WordPress.com Site/ } ) ) {
					expect( link ).toHaveAttribute( 'href', '/sites/wpcomsite.wordpress.com' );
				}
			} );
			for ( const link of screen.getAllByRole( 'link', { name: /Jetpack Site/ } ) ) {
				expect( link ).toHaveAttribute( 'href', '/sites/shared-domain.com' );
			}
		} );
	} );

	describe( 'empty state', () => {
		function mockDeletedSitesCount( deletedSiteCount: number ) {
			nock( 'https://public-api.wordpress.com' )
				.get( '/rest/v1.3/me/sites' )
				.query( ( query ) => query.site_visibility === 'deleted' )
				.reply( 200, { sites: [], total: deletedSiteCount } );
		}

		beforeEach( () => {
			mockPreferences();
		} );

		test( 'offers to restore a deleted site when the user has only deleted sites', async () => {
			mockDeletedSitesCount( 1 );

			render( <Sites />, { user: { site_count: 0 } as User } );

			expect(
				await screen.findByRole( 'heading', { name: 'You don’t have any active sites' } )
			).toBeVisible();
			const showDeletedSites = screen.getByRole( 'link', { name: 'Show deleted sites' } );
			expect( showDeletedSites ).toBeVisible();
			expect( showDeletedSites ).toHaveAttribute(
				'href',
				expect.stringContaining( 'is_deleted=true' )
			);
			expect( screen.getByRole( 'link', { name: 'Create a site' } ) ).toBeVisible();
		} );

		test( 'offers only to create a site when the user has no deleted sites', async () => {
			mockDeletedSitesCount( 0 );

			render( <Sites />, { user: { site_count: 0 } as User } );

			expect(
				await screen.findByRole( 'heading', { name: 'You don’t have any sites yet' } )
			).toBeVisible();
			expect( screen.getByRole( 'link', { name: 'Create a site' } ) ).toBeVisible();
			expect(
				screen.queryByRole( 'link', { name: 'Show deleted sites' } )
			).not.toBeInTheDocument();
		} );
	} );
} );
