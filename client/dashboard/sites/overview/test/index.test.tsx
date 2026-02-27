/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import SiteOverview from '../index';
import type { Site } from '@automattic/api-core';

const site = {
	ID: 1,
	name: 'Test Site',
	slug: 'test-site.wordpress.com',
	URL: 'https://test-site.wordpress.com',
	subscribers_count: 10,
	launch_status: 'launched',
	site_migration: {},
	plan: {
		product_slug: 'business-bundle',
		product_name_short: 'Business',
		is_free: false,
		features: {
			active: [
				'atomic',
				'backups',
				'backups-self-serve',
				'scan',
				'scan-self-serve',
				'performance',
				'full-activity-log',
			],
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

function getCard( text: string ) {
	return screen.getAllByRole( 'article' ).find( ( el ) => el.textContent?.includes( text ) );
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
			.get( '/rest/v1.1/domains/suggestions' )
			.query( true )
			.reply( 200, [ { domain_name: 'test-site.com', product_slug: 'dotcom_domain' } ] );

		nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/sites/${ site.ID }/activity` )
			.query( true )
			.reply( 200, { items: [] } );

		nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/sites/${ site.ID }/scan` )
			.query( true )
			.reply( 200, { threats: [] } );

		nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/sites/${ site.ID }/launchpad` )
			.query( true )
			.reply( 200, { checklist: [] } );

		nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/sites/${ site.ID }/site-profiler/pages` )
			.query( true )
			.reply( 200, { pages: [] } );

		nock( 'https://public-api.wordpress.com' )
			.get( `/rest/v1.1/sites/${ site.ID }/media-storage` )
			.query( true )
			.reply( 200, { max_storage_bytes: 1073741824, storage_used_bytes: 100000000 } );

		nock( 'https://public-api.wordpress.com' )
			.get( `/rest/v1.3/sites/${ site.ID }/plans` )
			.query( true )
			.reply( 200, {
				1: {
					product_id: 1,
					product_slug: 'business-bundle',
					product_name_short: 'Business',
					current_plan: true,
					original_price: { amount: 0 },
					raw_price: 0,
					raw_price_integer: 0,
					raw_discount: 0,
					raw_discount_integer: 0,
					cost_overrides: [],
				},
			} );

		nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/sites/${ site.ID }/preview-links` )
			.query( true )
			.reply( 200, { preview_links: [] } );

		nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/sites/${ site.ID }/hosting/metrics` )
			.query( true )
			.reply( 200, { data: { periods: {} } } );

		nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/sites/${ site.ID }/flex-usage` )
			.query( true )
			.reply( 200, {} );
	} );

	test( 'renders the overview of a site with free plan', async () => {
		mockSite( {
			...site,
			plan: {
				product_slug: 'free_plan',
				product_name_short: 'Free',
				is_free: true,
				features: { active: [] },
			},
		} as unknown as Site );

		render( <SiteOverview siteSlug={ site.slug } /> );
		await screen.findByRole( 'heading', { name: 'Test Site' } );
		await screen.findByText( 'Free' );

		expect( screen.getByRole( 'link', { name: /WP Admin/ } ) ).toBeVisible();

		expect( getCard( 'Visibility' ) ).toBeVisible();
		expect( getCard( 'Back up your site' ) ).toHaveTextContent( 'Upgrade to unlock' );
		expect( getCard( 'Migrate' ) ).toBeVisible();
		expect( getCard( 'Scan for security threats' ) ).toHaveTextContent( 'Upgrade to unlock' );
		expect( getCard( 'Plan' ) ).toBeVisible();
		expect( getCard( 'Latest activity' ) ).toBeVisible();
		expect( getCard( 'The perfect domain awaits' ) ).toBeVisible();
	} );

	test( 'renders the overview of a site with a paid plan on Atomic', async () => {
		mockSite( { ...site, is_wpcom_atomic: true } as Site );

		render( <SiteOverview siteSlug={ site.slug } /> );
		await screen.findByRole( 'heading', { name: 'Test Site' } );
		await screen.findByText( 'Business' );

		expect( screen.getByRole( 'link', { name: /WP Admin/ } ) ).toBeVisible();

		expect( getCard( 'Visibility' ) ).toBeVisible();
		expect( getCard( 'Last backup' ) ).toBeVisible();
		expect( getCard( 'Performance' ) ).toBeVisible();
		expect( getCard( 'Last scan' ) ).toBeVisible();
		expect( getCard( 'Plan' ) ).toBeVisible();
		expect( getCard( 'Latest activity' ) ).toBeVisible();
		expect( getCard( 'The perfect domain awaits' ) ).toBeVisible();
	} );

	test( 'renders the overview of a site with a paid plan pending Atomic activation', async () => {
		mockSite( { ...site, is_wpcom_atomic: false } as Site );

		render( <SiteOverview siteSlug={ site.slug } /> );
		await screen.findByRole( 'heading', { name: 'Test Site' } );
		await screen.findByText( 'Business' );

		expect( screen.getByRole( 'link', { name: /WP Admin/ } ) ).toBeVisible();

		expect( getCard( 'Visibility' ) ).toBeVisible();
		expect( getCard( 'Back up your site' ) ).toHaveTextContent( 'Activate to unlock' );
		expect( getCard( 'Test site performance' ) ).toHaveTextContent( 'Activate to unlock' );
		expect( getCard( 'Scan for security threats' ) ).toHaveTextContent( 'Activate to unlock' );
		expect( getCard( 'Plan' ) ).toBeVisible();
		expect( getCard( 'Latest activity' ) ).toBeVisible();
		expect( getCard( 'The perfect domain awaits' ) ).toBeVisible();
	} );

	test( 'renders the overview of an unlaunched site', async () => {
		mockSite( { ...site, launch_status: 'unlaunched' } as Site );
		render( <SiteOverview siteSlug={ site.slug } /> );

		await screen.findByRole( 'heading', { name: 'Test Site' } );
		await screen.findByText( 'Business' );

		expect( screen.getByRole( 'link', { name: /WP Admin/ } ) ).toBeVisible();

		expect( getCard( 'Finish setting up your site' ) ).toBeVisible();
		expect( getCard( 'We’ll bring your vision to life' ) ).toBeVisible();
		expect( getCard( 'The perfect domain awaits' ) ).toBeVisible();
	} );

	test( 'renders the overview of a commerce garden site', async () => {
		mockSite( { ...site, is_garden: true, garden_name: 'commerce' } as Site );
		render( <SiteOverview siteSlug={ site.slug } /> );

		await screen.findByRole( 'heading', { name: 'Test Site' } );

		expect( screen.getByRole( 'link', { name: 'Manage store' } ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: /WP Admin/ } ) ).not.toBeInTheDocument();

		expect( getCard( 'Plan' ) ).toBeVisible();
		expect( getCard( 'Visibility' ) ).toBeVisible();
	} );

	test( 'renders the overview of a self-hosted free Jetpack connected site', async () => {
		mockSite( {
			...site,
			jetpack: true,
			jetpack_connection: true,
			is_wpcom_atomic: false,
			plan: {
				...site.plan,
				product_slug: 'jetpack_free',
				product_name_short: 'Jetpack Free',
				is_free: true,
				features: { active: [] },
			},
		} as Site );

		render( <SiteOverview siteSlug={ site.slug } /> );
		await screen.findByRole( 'heading', { name: 'Test Site' } );

		expect( screen.getByRole( 'link', { name: /WP Admin/ } ) ).toBeVisible();

		expect( getCard( 'Visibility' ) ).toBeVisible();
		expect( getCard( 'Back up your site' ) ).toHaveTextContent( 'Upgrade to unlock' );
		expect( getCard( 'Subscribers' ) ).toBeVisible();
		expect( getCard( 'Scan for security threats' ) ).toHaveTextContent( 'Upgrade to unlock' );
		expect( getCard( 'Subscriptions' ) ).toBeVisible();
		expect( getCard( 'Latest activity' ) ).toBeVisible();
	} );

	test( 'renders the overview of an A4A dev site', async () => {
		mockSite( { ...site, is_wpcom_atomic: true, is_a4a_dev_site: true } as Site );

		render( <SiteOverview siteSlug={ site.slug } /> );
		await screen.findByRole( 'heading', { name: 'Test Site' } );
		await screen.findByText( 'Business' );

		expect( screen.getByRole( 'link', { name: /WP Admin/ } ) ).toBeVisible();

		expect( getCard( 'Visibility' ) ).toBeVisible();
		expect( getCard( 'Last backup' ) ).toBeVisible();
		expect( getCard( 'Share' ) ).toBeVisible();
		expect( getCard( 'Last scan' ) ).toBeVisible();
		expect( getCard( 'Development license' ) ).toBeVisible();
		expect( getCard( 'Latest activity' ) ).toBeVisible();
		expect( getCard( 'The perfect domain awaits' ) ).toBeVisible();
	} );

	test( 'renders the overview of a site with Flex plan', async () => {
		mockSite( { ...site, is_wpcom_flex: true } as Site );

		render( <SiteOverview siteSlug={ site.slug } /> );
		await screen.findByRole( 'heading', { name: 'Test Site' } );
		await screen.findByText( 'Business' );

		expect( screen.getByRole( 'link', { name: /WP Admin/ } ) ).toBeVisible();

		expect( getCard( 'Last backup' ) ).toBeVisible();
		expect( getCard( 'Performance' ) ).toBeVisible();
		expect( getCard( 'Last scan' ) ).toBeVisible();
		expect( getCard( 'Plan' ) ).toBeVisible();
		expect( getCard( 'Latest activity' ) ).toBeVisible();
		expect( getCard( 'Month-to-date site usage' ) ).toBeVisible();
		expect( getCard( 'The perfect domain awaits' ) ).toBeVisible();
	} );
} );
