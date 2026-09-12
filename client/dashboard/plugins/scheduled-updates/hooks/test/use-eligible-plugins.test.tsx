/**
 * @jest-environment jsdom
 */

import { siteCorePluginsQuery } from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useEligiblePlugins } from '../use-eligible-plugins';
import type { CorePlugin } from '@automattic/api-core';
import type { PropsWithChildren } from 'react';

function plugin( id: string, overrides: Partial< CorePlugin > = {} ): CorePlugin {
	return {
		plugin: id,
		name: id,
		status: 'active',
		plugin_uri: '',
		author: '',
		author_uri: '',
		description: '',
		version: '1.0',
		network_only: false,
		requires_wp: '',
		requires_php: '',
		textdomain: '',
		_links: { self: {} },
		...overrides,
	};
}

function setup( sites: Record< number, CorePlugin[] >, selectedSiteIds = [ '1' ] ) {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { staleTime: Infinity, retry: false } },
	} );
	const updatedAt = Date.now();
	for ( const [ siteId, plugins ] of Object.entries( sites ) ) {
		queryClient.setQueryData( siteCorePluginsQuery( Number( siteId ) ).queryKey, plugins, {
			updatedAt,
		} );
	}
	const wrapper = ( { children }: PropsWithChildren ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);
	return {
		...renderHook( ( ids ) => useEligiblePlugins( ids ), {
			initialProps: selectedSiteIds,
			wrapper,
		} ),
		queryClient,
		updatedAt,
	};
}

test( 'switches plugin choices when cached sites have the same update timestamp', async () => {
	const { result, rerender } = setup( { 1: [ plugin( 'first' ) ], 2: [ plugin( 'second' ) ] } );
	expect( result.current.map( ( item ) => item.plugin ) ).toEqual( [ 'first.php' ] );
	rerender( [ '2' ] );
	await waitFor( () => {
		expect( result.current.map( ( item ) => item.plugin ) ).toEqual( [ 'second.php' ] );
	} );
	rerender( [] );
	await waitFor( () => expect( result.current ).toEqual( [] ) );
} );

test( 'reflects changed cache data even when the update timestamp does not change', async () => {
	const { result, queryClient, updatedAt } = setup( { 1: [ plugin( 'first' ) ] } );
	act( () => {
		queryClient.setQueryData( siteCorePluginsQuery( 1 ).queryKey, [ plugin( 'replacement' ) ], {
			updatedAt,
		} );
	} );
	await waitFor( () => {
		expect( result.current.map( ( item ) => item.plugin ) ).toEqual( [ 'replacement.php' ] );
	} );
} );

test( 'keeps normalization, last-site deduplication, sorting, and managed-plugin exclusion', () => {
	const { result } = setup(
		{
			1: [ plugin( 'shared', { name: 'Old' } ), plugin( 'managed', { is_managed: true } ) ],
			2: [ plugin( 'shared.php', { name: 'Zebra &amp; Co' } ), plugin( 'alpha' ) ],
		},
		[ '1', '2' ]
	);
	expect( result.current.map( ( { plugin: id, name } ) => ( { id, name } ) ) ).toEqual( [
		{ id: 'alpha.php', name: 'alpha' },
		{ id: 'shared.php', name: 'Zebra & Co' },
	] );
} );
