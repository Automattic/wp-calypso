/**
 * @jest-environment jsdom
 */

import { omnibarSiteIdQuery, siteHourlyViewsQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor, within } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import { shoppingCartManagerClient } from '../../shopping-cart';
import OmnibarContainer from '../omnibar';

const site = {
	ID: 1,
	name: 'Test Site',
	site_migration: {},
};

const statsNode = {
	id: 'stats',
	title:
		"<div><img fetchpriority='low' loading='lazy' decoding='async' src='/wp-includes/charts/admin-bar-hours-scale.php?blog=1' srcset='/wp-includes/charts/admin-bar-hours-scale.php?blog=1 1x, /wp-includes/charts/admin-bar-hours-scale-2x.php?blog=1 2x' width='112' height='24' alt='Stats' title='Views over 48 hours. Click for more Stats.'></div>",
	parent: false,
	href: 'https://test-site.wordpress.com/wp-admin/admin.php?page=stats#!/stats/day/1',
	group: false,
	meta: {
		menu_title: 'Stats',
	},
};

function mockHourlyViews( status: number, body?: object ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ site.ID }/stats/visits` )
		.query( true )
		.reply( status, body );
}

function renderOmnibar() {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	queryClient.setQueryData( omnibarSiteIdQuery().queryKey, site.ID );

	return render( <OmnibarContainer cartManagerClient={ shoppingCartManagerClient } />, {
		queryClient,
	} );
}

describe( '<Omnibar> stats sparkline node', () => {
	beforeEach( () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/dashboard/admin-bar' )
			.query( true )
			.reply( 200, { nodes: [] } );
		nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/sites/${ site.ID }/admin-bar` )
			.query( true )
			.reply( 200, { nodes: [ statsNode ] } );
		nock( 'https://public-api.wordpress.com' )
			.get( `/rest/v1.1/sites/${ site.ID }` )
			.query( true )
			.reply( 200, site );
	} );

	afterEach( () => nock.cleanAll() );

	test( 'shows the node', async () => {
		mockHourlyViews( 200, {
			data: [
				[ '2026-10-01 00:00:00', 3 ],
				[ '2026-10-01 01:00:00', 7 ],
			],
		} );

		renderOmnibar();

		const toolbar = screen.getByRole( 'navigation', { name: 'Toolbar' } );
		const statsSparklineNode = await within( toolbar ).findByRole( 'button', {
			name: 'Views over 48 hours. Click for more Stats.',
		} );
		expect( statsSparklineNode ).toHaveAttribute( 'href', statsNode.href );
		// The chart labels its peak with the highest hourly views.
		expect( within( statsSparklineNode ).getByText( '7' ) ).toBeVisible();
	} );

	test( 'hides the node when the views fail to load', async () => {
		mockHourlyViews( 500 );
		jest.spyOn( console, 'error' ).mockImplementation( () => {} );

		const { queryClient } = renderOmnibar();

		const toolbar = screen.getByRole( 'navigation', { name: 'Toolbar' } );
		await within( toolbar ).findByRole( 'button', { name: 'Test Site' } );
		await waitFor( () =>
			expect( queryClient.getQueryState( siteHourlyViewsQuery( site.ID ).queryKey )?.status ).toBe(
				'error'
			)
		);
		expect(
			within( toolbar ).queryByRole( 'button', {
				name: 'Views over 48 hours. Click for more Stats.',
			} )
		).not.toBeInTheDocument();
	} );
} );
