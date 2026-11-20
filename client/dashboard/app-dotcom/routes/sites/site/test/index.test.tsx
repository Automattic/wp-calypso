/**
 * @vitest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { APP_CONTEXT_DEFAULT_CONFIG } from '../../../../../app/context';
import { render } from '../../../../../test-utils';
import SiteOverview from '../index';
import type { AppConfig } from '../../../../../app/context';
import type { Site, User } from '@automattic/api-core';

const site = {
	ID: 1,
	name: 'Test Site',
	slug: 'test-site.wordpress.com',
	site_migration: {},
	plan: {
		product_name_short: 'Business',
		features: {
			active: [ 'atomic', 'backups-self-serve', 'scan-self-serve', 'performance' ],
		},
	},
	options: {
		admin_url: 'https://test-site.wordpress.com/wp-admin/',
		created_at: '2026-01-01T00:00:00+00:00',
	},
} as unknown as Site;

function mockSite( mockedSite: Site ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ mockedSite.slug }` )
		.query( true )
		.reply( 200, mockedSite );
}

async function getCard( text: string ) {
	return waitFor( () => {
		const card = screen
			.getAllByRole( 'article' )
			.find( ( el ) => el.textContent?.includes( text ) );
		if ( ! card ) {
			throw new Error( `Card with text "${ text }" was not rendered` );
		}
		return card;
	} );
}

async function waitForPlanName( planName: string ) {
	await screen.findByText( planName );
}

describe( '<SiteOverview>', () => {
	beforeEach( () => {
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( '/rest/v1.1/me/preferences' )
			.query( true )
			.reply( 200, { calypso_preferences: {} } );

		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/all-domains' )
			.query( true )
			.reply( 200, { domains: [] } );

		nock( 'https://public-api.wordpress.com' )
			.get( `/rest/v1.4/sites/${ site.ID }/plans` )
			.query( true )
			.reply( 200, {
				plans: {
					1: {
						current_plan: true,
						original_price: { amount: 0 },
						cost_overrides: [],
					},
				},
			} );
	} );

	describe( 'header', () => {
		test( 'shows a link to the site’s WP Admin', async () => {
			mockSite( site );

			render( <SiteOverview siteSlug={ site.slug } /> );
			await screen.findByRole( 'heading', { name: 'Test Site' } );

			const wpAdminLink = screen.getByRole( 'link', { name: /WP Admin/ } );
			expect( wpAdminLink ).toBeVisible();
			expect( wpAdminLink ).toHaveAttribute( 'href', 'https://test-site.wordpress.com/wp-admin/' );
		} );
	} );

	describe( 'notices', () => {
		test( 'shows the two-step-required notice when the site requires it and the user has no two-step', async () => {
			const configWithMeSupport: AppConfig = {
				...APP_CONTEXT_DEFAULT_CONFIG,
				supports: {
					...APP_CONTEXT_DEFAULT_CONFIG.supports,
					me: { billing: { monetizeSubscriptions: true }, security: { sshKey: true }, apps: true },
				},
			};
			mockSite( {
				...site,
				jetpack: true,
				jetpack_modules: [ 'sso' ],
				options: { ...site.options, jetpack_sso_require_two_step: true },
			} as Site );

			render( <SiteOverview siteSlug={ site.slug } />, {
				config: configWithMeSupport,
				user: { two_step_enabled: false } as User,
			} );
			await screen.findByRole( 'heading', { name: 'Test Site' } );

			expect(
				await screen.findByText( 'Set up two-step authentication to access WP Admin' )
			).toBeVisible();
			expect( screen.getByText( /Test Site requires two-step authentication/ ) ).toBeVisible();
		} );

		test( 'shows the migration-completed notice alongside the arbiter’s notice when arriving from a finished migration', async () => {
			nock( 'https://public-api.wordpress.com' )
				.persist()
				.get( `/rest/v1.1/sites/${ site.ID }/media-storage` )
				.query( true )
				.reply( 200, { max_storage_bytes: 1000, storage_used_bytes: 2000 } );
			const migratedSite = {
				...site,
				site_migration: {
					type: 'wordpress',
					status_v2: 'completed',
					source_domain: 'example.com',
					completed_at: Math.floor( Date.now() / 1000 ) - 60,
				},
			} as unknown as Site;

			mockSite( migratedSite );
			const { unmount } = render( <SiteOverview siteSlug={ site.slug } /> );
			expect( await screen.findByText( 'Your site is out of storage' ) ).toBeVisible();
			expect( screen.queryByText( 'Your site is ready' ) ).not.toBeInTheDocument();
			unmount();

			mockSite( migratedSite );
			render( <SiteOverview siteSlug={ site.slug } search={ { migration: 'completed' } } /> );
			expect( await screen.findByText( 'Your site is out of storage' ) ).toBeVisible();
			expect( screen.getByText( 'Your site is ready' ) ).toBeVisible();
		} );
	} );

	describe( 'cards', () => {
		test( 'shows cards for a site with a free plan', async () => {
			mockSite( {
				...site,
				plan: {
					product_name_short: 'Free',
					is_free: true,
				},
			} as unknown as Site );

			render( <SiteOverview siteSlug={ site.slug } /> );

			await screen.findByRole( 'heading', { name: 'Test Site' } );
			await waitForPlanName( 'Free' );

			expect( await getCard( 'Visibility' ) ).toBeVisible();
			expect( await getCard( 'Back up your site' ) ).toHaveTextContent( 'Upgrade to unlock' );
			expect( await getCard( 'Migrate' ) ).toBeVisible();
			expect( await getCard( 'Scan for security threats' ) ).toHaveTextContent(
				'Upgrade to unlock'
			);
			expect( await getCard( 'Plan' ) ).toBeVisible();
			expect( await getCard( 'Latest activity' ) ).toBeVisible();
			expect( await getCard( 'The perfect domain awaits' ) ).toBeVisible();
		} );

		test( 'shows cards for a site with a paid plan on Atomic', async () => {
			mockSite( { ...site, is_wpcom_atomic: true } as Site );

			render( <SiteOverview siteSlug={ site.slug } /> );

			await screen.findByRole( 'heading', { name: 'Test Site' } );
			await waitForPlanName( 'Business' );

			expect( await getCard( 'Visibility' ) ).toBeVisible();
			expect( await getCard( 'Last backup' ) ).toBeVisible();
			expect( await getCard( 'Performance' ) ).toBeVisible();
			expect( await getCard( 'Last scan' ) ).toBeVisible();
			expect( await getCard( 'Plan' ) ).toBeVisible();
			expect( await getCard( 'Latest activity' ) ).toBeVisible();
			expect( await getCard( 'The perfect domain awaits' ) ).toBeVisible();
		} );

		test( 'shows cards for a site with a paid plan pending Atomic activation', async () => {
			mockSite( site );

			render( <SiteOverview siteSlug={ site.slug } /> );

			await screen.findByRole( 'heading', { name: 'Test Site' } );
			await waitForPlanName( 'Business' );

			expect( await getCard( 'Visibility' ) ).toBeVisible();
			expect( await getCard( 'Back up your site' ) ).toHaveTextContent( 'Activate to unlock' );
			expect( await getCard( 'Test site performance' ) ).toHaveTextContent( 'Activate to unlock' );
			expect( await getCard( 'Scan for security threats' ) ).toHaveTextContent(
				'Activate to unlock'
			);
			expect( await getCard( 'Plan' ) ).toBeVisible();
			expect( await getCard( 'Latest activity' ) ).toBeVisible();
			expect( await getCard( 'The perfect domain awaits' ) ).toBeVisible();
		} );

		test( 'shows cards for an unlaunched site', async () => {
			mockSite( { ...site, launch_status: 'unlaunched' } as Site );

			render( <SiteOverview siteSlug={ site.slug } /> );

			await screen.findByRole( 'heading', { name: 'Test Site' } );
			await waitForPlanName( 'Business' );

			expect( await getCard( 'Finish setting up your site' ) ).toBeVisible();
			expect( await getCard( 'We’ll bring your vision to life' ) ).toBeVisible();
			expect( await getCard( 'The perfect domain awaits' ) ).toBeVisible();
		} );

		test( 'shows cards for an unlaunched no-guidance site', async () => {
			mockSite( {
				...site,
				launch_status: 'unlaunched',
				capabilities: { manage_options: true },
				options: { ...site.options, wpcom_ai_launchpad_no_guidance: true },
			} as Site );

			render( <SiteOverview siteSlug={ site.slug } /> );

			await screen.findByRole( 'heading', { name: 'Test Site' } );
			await waitForPlanName( 'Business' );

			expect( await getCard( 'Ready to go public?' ) ).toBeVisible();
		} );

		test( 'shows cards for a self-hosted free Jetpack connected site', async () => {
			mockSite( {
				...site,
				jetpack: true,
				jetpack_connection: true,
				plan: {
					product_name_short: 'Jetpack Free',
					features: { active: [] },
				},
			} as unknown as Site );

			render( <SiteOverview siteSlug={ site.slug } /> );

			await screen.findByRole( 'heading', { name: 'Test Site' } );

			expect( await getCard( 'Visibility' ) ).toBeVisible();
			expect( await getCard( 'Back up your site' ) ).toHaveTextContent( 'Upgrade to unlock' );
			expect( await getCard( 'Subscribers' ) ).toBeVisible();
			expect( await getCard( 'Scan for security threats' ) ).toHaveTextContent(
				'Upgrade to unlock'
			);
			expect( await getCard( 'Subscriptions' ) ).toBeVisible();
			expect( await getCard( 'Latest activity' ) ).toBeVisible();
		} );

		test( 'shows cards for an A4A dev site', async () => {
			mockSite( { ...site, is_wpcom_atomic: true, is_a4a_dev_site: true } as Site );

			render( <SiteOverview siteSlug={ site.slug } /> );

			await screen.findByRole( 'heading', { name: 'Test Site' } );
			await waitForPlanName( 'Business' );

			expect( await getCard( 'Visibility' ) ).toBeVisible();
			expect( await getCard( 'Last backup' ) ).toBeVisible();
			expect( await getCard( 'Share' ) ).toBeVisible();
			expect( await getCard( 'Last scan' ) ).toBeVisible();
			expect( await getCard( 'Development license' ) ).toBeVisible();
			expect( await getCard( 'Latest activity' ) ).toBeVisible();
		} );

		test( 'shows cards for an unlaunched A4A dev site', async () => {
			mockSite( { ...site, launch_status: 'unlaunched', is_a4a_dev_site: true } as Site );

			render( <SiteOverview siteSlug={ site.slug } /> );

			await screen.findByRole( 'heading', { name: 'Test Site' } );
			await waitForPlanName( 'Business' );

			expect( await getCard( 'Visibility' ) ).toHaveTextContent( 'Finish setting up your site.' );
			expect( await getCard( 'Back up your site' ) ).toHaveTextContent( 'Activate to unlock' );
			expect( await getCard( 'Share' ) ).toBeVisible();
			expect( await getCard( 'Scan for security threats' ) ).toHaveTextContent(
				'Activate to unlock'
			);
			expect( await getCard( 'Development license' ) ).toBeVisible();
			expect( await getCard( 'Latest activity' ) ).toBeVisible();
		} );

		test( 'shows cards for an inaccessible Jetpack site', async () => {
			nock( 'https://public-api.wordpress.com' ).post( '/rest/v1.1/logstash' ).reply( 200 );
			mockSite( {
				...site,
				__inaccessible_jetpack_error: new Error( 'Connection failed' ),
			} as Site );

			render( <SiteOverview siteSlug={ site.slug } /> );

			await screen.findByRole( 'heading', { name: 'Test Site' } );

			expect( await getCard( 'Last backup' ) ).toHaveTextContent( 'Connection issue' );
			expect( await getCard( 'Last scan' ) ).toHaveTextContent( 'Connection issue' );
			expect( await getCard( 'Performance' ) ).toHaveTextContent( 'Connection issue' );
			expect( await getCard( 'Visibility' ) ).toHaveTextContent( 'Connection issue' );
			expect( await getCard( 'Plan' ) ).toBeVisible();
		} );
	} );
} );
