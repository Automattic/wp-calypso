/**
 * @jest-environment jsdom
 */

import { siteHourlyViewsQuery } from '@automattic/api-queries';
import { Omnibar, buildOmnibarNodesFromAdminBarNodes } from '@automattic/omnibar';
import { screen, waitFor, within } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../../test-utils';
import { createStatsSparklineNodeBuilder } from '../index';
import type { AdminBarNode } from '@automattic/omnibar';

const siteId = 1;

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
} as AdminBarNode;

function mockHourlyViews( status: number, body?: object ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ siteId }/stats/visits` )
		.query( true )
		.reply( status, body );
}

function StatsSparklineNodeOmnibar() {
	const { siteNodes } = buildOmnibarNodesFromAdminBarNodes( [ statsNode ], {
		stats: createStatsSparklineNodeBuilder( { siteId } ),
	} );
	return <Omnibar nodes={ { site: { id: 'site-name', title: 'Test Site' }, siteNodes } } />;
}

describe( '<Omnibar> stats sparkline node', () => {
	test( 'shows the node', async () => {
		mockHourlyViews( 200, {
			data: [
				[ '2026-10-01 00:00:00', 3 ],
				[ '2026-10-01 01:00:00', 7 ],
			],
		} );

		render( <StatsSparklineNodeOmnibar /> );

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

		const { queryClient } = render( <StatsSparklineNodeOmnibar /> );

		const toolbar = screen.getByRole( 'navigation', { name: 'Toolbar' } );
		await waitFor( () =>
			expect( queryClient.getQueryState( siteHourlyViewsQuery( siteId ).queryKey )?.status ).toBe(
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
