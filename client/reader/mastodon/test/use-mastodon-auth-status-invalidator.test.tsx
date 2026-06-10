/**
 * @jest-environment jsdom
 */
import { mastodonAuthStatusQueryOptions } from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { useMastodonAuthStatusInvalidator } from '../use-mastodon-auth-status-invalidator';

function wrapper( client: QueryClient ) {
	return function Wrapper( { children }: { children: ReactNode } ) {
		return <QueryClientProvider client={ client }>{ children }</QueryClientProvider>;
	};
}

describe( 'useMastodonAuthStatusInvalidator', () => {
	it( 'invalidates auth-status when a mastodon query errors with auth_required', () => {
		const client = new QueryClient();
		client.setQueryData( mastodonAuthStatusQueryOptions( 42 ).queryKey, {
			needs_reauth: false,
		} );

		renderHook( () => useMastodonAuthStatusInvalidator( 42 ), {
			wrapper: wrapper( client ),
		} );

		client.getQueryCache().notify( {
			type: 'updated',
			query: { queryKey: [ 'reader', 'mastodon', 'timeline', 42 ] } as any,
			action: { type: 'error', error: { kind: 'auth_required' } as any },
		} as any );

		const state = client.getQueryState( mastodonAuthStatusQueryOptions( 42 ).queryKey );
		expect( state?.isInvalidated ).toBe( true );
	} );

	it( 'ignores errors on non-mastodon query keys', () => {
		const client = new QueryClient();
		client.setQueryData( mastodonAuthStatusQueryOptions( 42 ).queryKey, {
			needs_reauth: false,
		} );

		renderHook( () => useMastodonAuthStatusInvalidator( 42 ), {
			wrapper: wrapper( client ),
		} );

		client.getQueryCache().notify( {
			type: 'updated',
			query: { queryKey: [ 'reader', 'atmosphere', 'timeline', 42 ] } as any,
			action: { type: 'error', error: { kind: 'auth_required' } as any },
		} as any );

		const state = client.getQueryState( mastodonAuthStatusQueryOptions( 42 ).queryKey );
		expect( state?.isInvalidated ).toBe( false );
	} );

	it( 'ignores errors of non-auth_required kind', () => {
		const client = new QueryClient();
		client.setQueryData( mastodonAuthStatusQueryOptions( 42 ).queryKey, {
			needs_reauth: false,
		} );

		renderHook( () => useMastodonAuthStatusInvalidator( 42 ), {
			wrapper: wrapper( client ),
		} );

		client.getQueryCache().notify( {
			type: 'updated',
			query: { queryKey: [ 'reader', 'mastodon', 'timeline', 42 ] } as any,
			action: { type: 'error', error: { kind: 'rate_limited' } as any },
		} as any );

		const state = client.getQueryState( mastodonAuthStatusQueryOptions( 42 ).queryKey );
		expect( state?.isInvalidated ).toBe( false );
	} );
} );
