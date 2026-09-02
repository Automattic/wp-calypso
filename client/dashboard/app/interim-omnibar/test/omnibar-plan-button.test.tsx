/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { InterimOmnibar } from '../interim-omnibar';
import type { Site, User } from '@automattic/api-core';

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

const PURCHASE_ID = 12345;

const user = {
	ID: 1,
	username: 'testuser',
	display_name: 'Test User',
	site_count: 1,
	primary_blog: 1,
} as User;

const site = {
	ID: 1,
	name: 'Test Site',
	slug: 'test-site.wordpress.com',
	URL: 'https://test-site.wordpress.com',
	launch_status: 'launched',
	is_a4a_dev_site: false,
	is_wpcom_staging_site: false,
	is_wpcom_atomic: false,
	is_deleted: false,
	jetpack: false,
	site_migration: {
		migration_status: undefined,
	},
	capabilities: {
		manage_options: true,
	},
	options: {
		admin_url: 'https://test-site.wordpress.com/wp-admin/',
	},
	plan: {
		product_id: 1009,
		product_slug: 'value_bundle',
		product_name_short: 'Explorer',
		is_free: false,
	},
} as Site;

describe( '<InterimOmnibar /> plan button', () => {
	const originalLocation = window.location;

	beforeEach( () => {
		// `isDashboardBackport()` keys off the hostname; `my.localhost` makes it
		// resolve to the native Dashboard purchase route rather than the backport.
		delete ( window as unknown as { location?: Location } ).location;
		( window as unknown as { location: Partial< Location > } ).location = {
			...originalLocation,
			hostname: 'my.localhost',
		};

		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.4/sites/1/plans' )
			.query( true )
			.reply( 200, {
				plans: {
					'1009': {
						id: String( PURCHASE_ID ),
						product_id: 1009,
						product_slug: 'value_bundle',
						current_plan: true,
						original_price: { amount: 0 },
						raw_price: 0,
						raw_price_integer: 0,
						raw_discount: 0,
						raw_discount_integer: 0,
						cost_overrides: [],
					},
				},
			} );

		nock( 'https://public-api.wordpress.com' )
			.get( `/rest/v1.2/upgrades/${ PURCHASE_ID }` )
			.query( true )
			.reply( 200, {
				ID: String( PURCHASE_ID ),
				blog_id: '1',
				product_id: '1009',
				user_id: '1',
				ownership_id: '1',
				attached_to_purchase_id: null,
			} );

		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/sites/1/stats/visits' )
			.query( true )
			.reply( 200, { data: [ [ '2025-01-01 00:00:00', 3 ] ] } );
	} );

	afterEach( () => {
		( window as unknown as { location: Location } ).location = originalLocation;
	} );

	test( 'navigates the Plan menu item to the dashboard purchase page', async () => {
		// `InterimOmnibarContainer` renders this component outside any
		// `QueryClientProvider`, so its queries must use the shared client directly.
		// Rendering with bare RTL (no providers) reproduces that environment.
		render( <InterimOmnibar user={ user } site={ site } currentRoute="/sites" /> );

		const planLink = await screen.findByRole( 'link', { name: /plan/i } );

		// The link is rendered immediately with the upgrade URL, then settles on the
		// purchase URL once the current plan's purchase resolves.
		await waitFor( () =>
			expect( planLink ).toHaveAttribute( 'href', `/me/billing/purchases/${ PURCHASE_ID }` )
		);
	} );
} );
