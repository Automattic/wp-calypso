/**
 * @jest-environment jsdom
 */
import {
	dashboardAdminBarQuery,
	omnibarSiteIdQuery,
	queryClient,
	siteAdminBarQuery,
} from '@automattic/api-queries';
import { renderHook } from '@testing-library/react';
import nock from 'nock';
import { useCanShowAiChatNode } from '../node-ai-chat-can-show';

const siteId = 123;

function mockAdminBarResponse( path: string, status: number ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/wpcom/v2${ path }` )
		.query( true )
		.reply( status, status === 200 ? { nodes: [] } : { error: 'failed', message: 'failed' } );
}

describe( 'useCanShowAiChatNode', () => {
	beforeEach( () => queryClient.clear() );

	test( 'is true while the admin-bar nodes load', () => {
		const { result } = renderHook( () => useCanShowAiChatNode() );

		expect( result.current ).toBe( true );
	} );

	test.each( [
		{ expected: false, because: 'the dashboard nodes failed and there is no site', site: null },
		{ expected: true, because: "the site's nodes loaded", site: 200 },
		{ expected: false, because: 'both the dashboard and site nodes failed', site: 500 },
	] )( 'is $expected when $because', async ( { site, expected } ) => {
		mockAdminBarResponse( '/dashboard/admin-bar', 500 );
		await queryClient.prefetchQuery( { ...dashboardAdminBarQuery(), retry: false } );
		if ( site ) {
			queryClient.setQueryData( omnibarSiteIdQuery().queryKey, siteId );
			mockAdminBarResponse( `/sites/${ siteId }/admin-bar`, site );
			await queryClient.prefetchQuery( { ...siteAdminBarQuery( siteId ), retry: false } );
		}

		const { result } = renderHook( () => useCanShowAiChatNode() );

		expect( result.current ).toBe( expected );
	} );

	test( 'stays true when a refetch fails after the nodes loaded', async () => {
		mockAdminBarResponse( '/dashboard/admin-bar', 200 );
		await queryClient.prefetchQuery( dashboardAdminBarQuery() );
		mockAdminBarResponse( '/dashboard/admin-bar', 500 );
		await queryClient.fetchQuery( { ...dashboardAdminBarQuery(), retry: false } ).catch( () => {} );

		const { result } = renderHook( () => useCanShowAiChatNode() );

		expect( result.current ).toBe( true );
	} );
} );
