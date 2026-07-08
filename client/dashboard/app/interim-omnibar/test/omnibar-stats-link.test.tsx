/**
 * @jest-environment jsdom
 */

import { queryClient } from '@automattic/api-queries';
import { render, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { InterimOmnibar } from '../interim-omnibar';
import type { Site, User } from '@automattic/api-core';

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

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
		update_plugins: true,
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
} as unknown as Site;

const siteWithStatsCapability = {
	...site,
	capabilities: {
		manage_options: false,
		update_plugins: true,
		view_stats: true,
	},
} as Site;

beforeEach( () => {
	queryClient.clear();

	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.4/sites/1/plans' )
		.query( true )
		.reply( 200, {
			plans: {
				'1009': {
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
		.get( '/rest/v1.1/sites/1/stats/visits' )
		.query( true )
		.reply( 200, { data: [] } );
} );

afterEach( () => {
	queryClient.clear();
} );

test( 'renders a Stats link in the site dropdown when the user can manage options', async () => {
	const { container } = render(
		<InterimOmnibar user={ user } site={ site } currentRoute="/sites" />
	);

	expect( screen.getByRole( 'link', { name: 'Stats' } ) ).toHaveAttribute(
		'href',
		'https://test-site.wordpress.com/wp-admin/admin.php?page=stats'
	);
	expect( container.querySelector( '.masterbar__item-stats-sparkline' ) ).toBeNull();

	await waitFor( () => expect( nock.isDone() ).toBe( true ) );
} );

test( 'renders a Stats link in the site dropdown when the user can view stats', async () => {
	render( <InterimOmnibar user={ user } site={ siteWithStatsCapability } currentRoute="/sites" /> );

	expect( screen.getByRole( 'link', { name: 'Stats' } ) ).toHaveAttribute(
		'href',
		'https://test-site.wordpress.com/wp-admin/admin.php?page=stats'
	);

	await waitFor( () => expect( nock.isDone() ).toBe( true ) );
} );
