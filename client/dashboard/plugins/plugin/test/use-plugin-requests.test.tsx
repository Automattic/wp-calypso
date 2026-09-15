/**
 * @jest-environment jsdom
 */

import { marketplaceSearchQuery, pluginsQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'jest-fetch-mock';
import nock from 'nock';
import { useState } from 'react';
import { render } from '../../../test-utils';
import { usePlugin } from '../use-plugin';

const originalFetch = global.fetch;
beforeAll( () => {
	fetchMock.enableMocks();
	fetchMock.dontMock();
} );
afterAll( () => {
	fetchMock.disableMocks();
	global.fetch = originalFetch;
} );

function PluginProbe( { enabled = true }: { enabled?: boolean } ) {
	const { plugin, icon, isLoading } = usePlugin( 'selected', { enabled } );
	return (
		<>
			<p>{ isLoading ? 'Loading' : 'Ready' }</p>
			<p>Name: { plugin?.name }</p>
			<p>Author: { plugin?.author }</p>
			<p>Icon: { icon }</p>
		</>
	);
}

function ToggleProbe() {
	const [ enabled, setEnabled ] = useState( false );
	return (
		<>
			<button onClick={ () => setEnabled( true ) }>Open details</button>
			<PluginProbe enabled={ enabled } />
		</>
	);
}

function cacheIcon( queryClient: QueryClient, groupId = 'wporg' ) {
	queryClient.setQueryData< unknown >(
		marketplaceSearchQuery( { slugs: [ 'selected' ], perPage: 20, groupId } ).queryKey,
		{
			data: {
				results: [
					{ fields: { slug: 'selected', plugin: { icons: 'https://example.com/cached.png' } } },
				],
			},
		}
	);
}

function mockPluginSources( { installed = true, status = 200 } = {} ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/me/sites' )
		.query( true )
		.reply( 200, { sites: [] } )
		.get( '/rest/v1.1/me/sites/plugins' )
		.query( true )
		.reply( status, {
			sites: installed
				? { 1: [ { slug: 'selected', name: 'Installed plugin', author: 'Installed Author' } ] }
				: {},
		} )
		.get( '/rest/v1.2/sites/1/plugins/selected' )
		.query( true )
		.reply( 200, {} )
		.get( '/wpcom/v2/marketplace/products' )
		.query( true )
		.reply( 200, { results: {} } );
}

function mockDirectory() {
	return nock( 'https://api.wordpress.org' )
		.get( '/plugins/info/1.2/' )
		.query( true )
		.reply( 200, {
			name: 'Directory plugin',
			author: '<a href="https://example.com/author">Directory Author</a>',
			icons: { '1x': 'https://example.com/directory.png' },
		} );
}

test( 'uses a cached directory icon without requesting redundant plugin metadata', async () => {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	cacheIcon( queryClient );
	mockPluginSources();
	const directory = mockDirectory();
	render( <PluginProbe />, { queryClient } );
	await waitFor( () => expect( screen.getByText( 'Ready' ) ).toBeVisible() );
	expect( screen.getByText( 'Name: Installed plugin' ) ).toBeVisible();
	expect( screen.getByText( 'Author: Installed Author' ) ).toBeVisible();
	expect( screen.getByText( 'Icon: https://example.com/cached.png' ) ).toBeVisible();
	expect( directory.isDone() ).toBe( false );
} );

test.each( [ 200, 500 ] )(
	'fetches directory metadata when installed metadata is absent (HTTP %i), despite a cached icon',
	async ( status ) => {
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		cacheIcon( queryClient );
		mockPluginSources( { installed: false, status } );
		const directory = mockDirectory();
		render( <PluginProbe />, { queryClient } );
		await waitFor( () => expect( screen.getByText( 'Name: Directory plugin' ) ).toBeVisible() );
		expect( screen.getByText( 'Author: Directory Author' ) ).toBeVisible();
		expect( screen.getByText( 'Icon: https://example.com/cached.png' ) ).toBeVisible();
		expect( directory.isDone() ).toBe( true );
	}
);

test( 'does not use marketplace-product icons as directory plugin icons', async () => {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	cacheIcon( queryClient, 'marketplace' );
	mockPluginSources();
	const directory = mockDirectory();
	render( <PluginProbe />, { queryClient } );
	await waitFor( () => expect( screen.getByText( 'Ready' ) ).toBeVisible() );
	expect( screen.getByText( 'Icon: https://example.com/directory.png' ) ).toBeVisible();
	expect( directory.isDone() ).toBe( true );
} );

test( 'fetches metadata after the last installed copy disappears from the cache', async () => {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	cacheIcon( queryClient );
	mockPluginSources();
	const directory = mockDirectory();
	render( <PluginProbe />, { queryClient } );
	await waitFor( () => expect( screen.getByText( 'Ready' ) ).toBeVisible() );
	expect( screen.getByText( 'Author: Installed Author' ) ).toBeVisible();
	expect( directory.isDone() ).toBe( false );
	act( () => {
		queryClient.setQueryData( pluginsQuery().queryKey, { sites: {} } );
	} );
	await waitFor( () => expect( screen.getByText( 'Name: Directory plugin' ) ).toBeVisible() );
	expect( screen.getByText( 'Author: Directory Author' ) ).toBeVisible();
	expect( directory.isDone() ).toBe( true );
} );

test( 'defers all detail requests until enabled, even with cached plugins from 100 sites', async () => {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	queryClient.setQueryData< unknown >( pluginsQuery().queryKey, {
		sites: Object.fromEntries(
			Array.from( { length: 100 }, ( _, index ) => [
				index + 1,
				[ { slug: 'selected', name: 'Installed plugin', author: 'Installed Author' } ],
			] )
		),
	} );
	let siteRequests = 0;
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( /\/rest\/v1\.2\/sites\/\d+\/plugins\/selected/ )
		.query( true )
		.reply( 200, () => {
			siteRequests++;
			return {};
		} );
	const sources = mockPluginSources();
	const directory = mockDirectory();
	render( <ToggleProbe />, { queryClient } );
	await waitFor( () => expect( screen.getByText( 'Ready' ) ).toBeVisible() );
	expect( siteRequests ).toBe( 0 );
	expect( directory.isDone() ).toBe( false );
	expect( sources.isDone() ).toBe( false );
	expect( sources.pendingMocks() ).toHaveLength( 4 );
	await userEvent.click( screen.getByRole( 'button', { name: 'Open details' } ) );
	await waitFor( () => expect( screen.getByText( 'Ready' ) ).toBeVisible() );
	expect( siteRequests ).toBeGreaterThan( 0 );
	expect( directory.isDone() ).toBe( true );
} );
