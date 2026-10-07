/**
 * @jest-environment jsdom
 */
import { buildOmnibarNodesFromAdminBarNodes } from '@automattic/omnibar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { removeUndrawnStatsNode, useStatsSparklineNodeBuilder } from '../plugin-stats-sparkline';
import type { Site } from '@automattic/api-core';
import type { AdminBarNode } from '@automattic/omnibar';

const site = { ID: 1 } as Site;

const statsNode = {
	id: 'stats',
	title: '<div><img src="chart.png"></div>',
	parent: false,
	href: 'https://example.com/wp-admin/admin.php?page=jetpack-premium-analytics-wp-admin',
	group: false,
} as AdminBarNode;

const commentsNode = { ...statsNode, id: 'comments' } as AdminBarNode;

function renderNodeBuilder( adminBarNodes: AdminBarNode[] ) {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	const wrapper = ( { children }: { children: React.ReactNode } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);

	return {
		queryClient,
		...renderHook( () => useStatsSparklineNodeBuilder( { site, adminBarNodes } ), { wrapper } ),
	};
}

describe( 'useStatsSparklineNodeBuilder', () => {
	test( 'draws the site admin bar Stats node as a chart instead of its image markup', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/sites/1/stats/visits' )
			.query( true )
			.reply( 200, { data: [ [ '2026-10-01 00:00:00', 3 ] ] } );

		const { result } = renderNodeBuilder( [ statsNode ] );

		await waitFor( () => expect( result.current ).toBeDefined() );
		const builder = result.current as NonNullable< typeof result.current >;
		const [ node ] =
			buildOmnibarNodesFromAdminBarNodes( [ statsNode ], { stats: builder } ).siteActions ?? [];
		expect( node.title ).toBeUndefined();
		expect( node.href ).toBe( statsNode.href );
		expect( node.render ).toBeDefined();
	} );

	test( 'fetches no views when the site admin bar has no Stats node', () => {
		const { result, queryClient } = renderNodeBuilder( [] );

		expect( queryClient.isFetching() ).toBe( 0 );
		expect( result.current ).toBeUndefined();
	} );
} );

describe( 'removeUndrawnStatsNode', () => {
	test( 'leaves out the Stats node until there is a builder to draw it', () => {
		expect( removeUndrawnStatsNode( [ statsNode, commentsNode ], undefined ) ).toEqual( [
			commentsNode,
		] );
		expect( removeUndrawnStatsNode( [ statsNode, commentsNode ], () => ( {} ) ) ).toEqual( [
			statsNode,
			commentsNode,
		] );
	} );
} );
