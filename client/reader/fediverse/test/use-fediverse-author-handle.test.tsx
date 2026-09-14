/**
 * @jest-environment jsdom
 */
import { readerFediverseKeys, type FediverseConnectionsResponse } from '@automattic/api-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { useFediverseAuthorHandle } from '../composer-config';

function seedConnections( client: QueryClient, response: FediverseConnectionsResponse ) {
	client.setQueryData( readerFediverseKeys.connections(), response );
}

function wrapperFor( client: QueryClient ) {
	return function Wrapper( { children }: { children: React.ReactNode } ) {
		return <QueryClientProvider client={ client }>{ children }</QueryClientProvider>;
	};
}

const baseConnection = {
	id: 1,
	blog_id: 100,
	url: 'https://myblog.wordpress.com',
	name: 'My Blog',
	icon: '',
	webfinger: '@myblog@myblog.wordpress.com',
};

describe( 'useFediverseAuthorHandle', () => {
	it( 'returns null when connectionId is null (skips the query)', () => {
		const client = new QueryClient();
		const { result } = renderHook( () => useFediverseAuthorHandle( null ), {
			wrapper: wrapperFor( client ),
		} );
		expect( result.current ).toBeNull();
	} );

	it( 'returns the trailing @domain segment from the webfinger handle', () => {
		const client = new QueryClient();
		seedConnections( client, { connections: [ baseConnection ] } );

		const { result } = renderHook( () => useFediverseAuthorHandle( 1 ), {
			wrapper: wrapperFor( client ),
		} );

		expect( result.current ).toBe( 'myblog.wordpress.com' );
	} );

	it( 'returns null when the matching connection has no webfinger', () => {
		const client = new QueryClient();
		seedConnections( client, {
			connections: [ { ...baseConnection, webfinger: '' } ],
		} );

		const { result } = renderHook( () => useFediverseAuthorHandle( 1 ), {
			wrapper: wrapperFor( client ),
		} );

		expect( result.current ).toBeNull();
	} );

	it( 'returns null when no connection matches the connectionId', () => {
		const client = new QueryClient();
		seedConnections( client, { connections: [ baseConnection ] } );

		const { result } = renderHook( () => useFediverseAuthorHandle( 999 ), {
			wrapper: wrapperFor( client ),
		} );

		expect( result.current ).toBeNull();
	} );

	it( 'handles a webfinger without a leading @ by keeping only the trailing segment', () => {
		const client = new QueryClient();
		seedConnections( client, {
			connections: [ { ...baseConnection, webfinger: 'myblog@myblog.wordpress.com' } ],
		} );

		const { result } = renderHook( () => useFediverseAuthorHandle( 1 ), {
			wrapper: wrapperFor( client ),
		} );

		expect( result.current ).toBe( 'myblog.wordpress.com' );
	} );

	it( 'returns null when the webfinger has no @ separator (malformed shape)', () => {
		// Don't surface a raw hostname as if it were a domain — the modal
		// title would lie about the destination ("New post · @bare-host").
		const client = new QueryClient();
		seedConnections( client, {
			connections: [ { ...baseConnection, webfinger: 'bare-host' } ],
		} );

		const { result } = renderHook( () => useFediverseAuthorHandle( 1 ), {
			wrapper: wrapperFor( client ),
		} );

		expect( result.current ).toBeNull();
	} );
} );
