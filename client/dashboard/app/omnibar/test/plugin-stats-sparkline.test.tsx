/**
 * @jest-environment jsdom
 */
import { Omnibar, buildOmnibarNodesFromAdminBarNodes } from '@automattic/omnibar';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import { createStatsSparklineNodeBuilder } from '../plugin-stats-sparkline';
import type { AdminBarNode } from '@automattic/omnibar';

const LABEL = 'Views over 48 hours. Click for more Stats.';

const statsNode = {
	id: 'stats',
	title: '<div><img src="chart.png"></div>',
	parent: false,
	href: 'https://example.com/wp-admin/admin.php?page=jetpack-premium-analytics-wp-admin',
	group: false,
} as AdminBarNode;

const newContentNode = {
	id: 'new-content',
	title: 'New',
	parent: false,
	href: 'https://example.com/wp-admin/post-new.php',
	group: false,
} as AdminBarNode;

function renderOmnibar( siteId?: number ) {
	const nodes = buildOmnibarNodesFromAdminBarNodes( [ newContentNode, statsNode ], {
		stats: createStatsSparklineNodeBuilder( { siteId } ),
	} );
	return render( <Omnibar nodes={ { ...nodes, site: { id: 'site-name', title: 'Site' } } } /> );
}

describe( '<Omnibar> stats sparkline', () => {
	test( 'draws the site admin bar Stats node as a chart once the views arrive', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/sites/1/stats/visits' )
			.query( true )
			.reply( 200, { data: [ [ '2026-10-01 00:00:00', 3 ] ] } );

		renderOmnibar( 1 );

		expect( await screen.findByRole( 'button', { name: 'New' } ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: LABEL } ) ).not.toBeInTheDocument();

		const statsLink = await screen.findByRole( 'button', { name: LABEL } );
		expect( statsLink ).toHaveAttribute( 'href', statsNode.href );
	} );

	test( 'leaves the Stats node out when the views fail to load', async () => {
		const scope = nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/sites/1/stats/visits' )
			.query( true )
			.reply( 500 );
		jest.spyOn( console, 'error' ).mockImplementation( () => {} );

		renderOmnibar( 1 );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		expect( await screen.findByRole( 'button', { name: 'New' } ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: LABEL } ) ).not.toBeInTheDocument();
	} );

	test( 'leaves the Stats node out without a site to fetch views for', async () => {
		const { queryClient } = renderOmnibar();

		expect( await screen.findByRole( 'button', { name: 'New' } ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: LABEL } ) ).not.toBeInTheDocument();
		expect( queryClient.isFetching() ).toBe( 0 );
	} );
} );
