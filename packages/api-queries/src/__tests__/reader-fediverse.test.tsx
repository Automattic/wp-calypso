// `logToLogstash` fires a real HTTPS request to the wpcom logstash
// endpoint. Mute it so the optimistic-mutation onError tests don't
// trigger an unmocked nock request.
jest.mock( 'calypso/lib/logstash', () => ( {
	logToLogstash: jest.fn(),
} ) );

import { readerFediverseKeys, type FediverseAuthorProfile } from '@automattic/api-core';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import {
	followFediverseActorMutation,
	normalizeFediverseActor,
	unfollowFediverseActorMutation,
} from '../reader-fediverse';

const BASE = 'https://public-api.wordpress.com';

function makeWrapper( c: QueryClient ) {
	function Wrapper( { children }: { children: React.ReactNode } ) {
		return <QueryClientProvider client={ c }>{ children }</QueryClientProvider>;
	}
	return Wrapper;
}

function makeProfile( overrides: Partial< FediverseAuthorProfile > = {} ): FediverseAuthorProfile {
	return {
		id: 'https://example.com/users/alice',
		username: 'alice',
		acct: '@alice@example.com',
		handle: '@alice@example.com',
		instance: 'example.com',
		display_name: 'Alice',
		note: '',
		avatar: null,
		header: null,
		url: 'https://example.com/@alice',
		locked: false,
		counts: { followers: 10, following: 5, posts: 42 },
		viewer: { following: false, followed_by: false, requested: false },
		is_self: false,
		...overrides,
	};
}

describe( 'followFediverseActorMutation / unfollowFediverseActorMutation', () => {
	afterEach( () => nock.cleanAll() );

	describe( 'followFediverseActorMutation', () => {
		it( 'optimistically sets viewer.following=true on follow (unlocked target)', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const key = readerFediverseKeys.authorProfile( 1, 'alice@example.com' );
			client.setQueryData( key, makeProfile() );

			nock( BASE )
				.post( '/wpcom/v2/reader/fediverse/connections/1/follows' )
				.reply( 200, {
					viewer: { following: true, followed_by: false, requested: false },
				} );

			const { result } = renderHook( () => useMutation( followFediverseActorMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			await act( async () => {
				await result.current.mutateAsync( {
					connectionId: 1,
					actor: 'alice@example.com',
				} );
			} );

			const cached = client.getQueryData< FediverseAuthorProfile >( key );
			expect( cached?.viewer?.following ).toBe( true );
			expect( cached?.viewer?.requested ).toBe( false );
		} );

		it( 'optimistically sets viewer.requested=true (not following) when vars.locked is true', async () => {
			// Without the locked branch the patch would write `following: true`
			// for the duration of the round-trip, then snap to `requested: true`
			// on commit — a UX flip-flop and a misleading mid-flight aria-label.
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const key = readerFediverseKeys.authorProfile( 1, 'alice@example.com' );
			client.setQueryData( key, makeProfile( { locked: true } ) );

			nock( BASE )
				.post( '/wpcom/v2/reader/fediverse/connections/1/follows' )
				.delay( 50 )
				.reply( 200, {
					viewer: { following: false, followed_by: false, requested: true },
				} );

			const { result } = renderHook( () => useMutation( followFediverseActorMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			let inFlight: Promise< unknown > | undefined;
			act( () => {
				inFlight = result.current.mutateAsync( {
					connectionId: 1,
					actor: 'alice@example.com',
					locked: true,
				} );
			} );

			// Wait for onMutate to resolve before reading the cache — the
			// optimistic patch lands synchronously after cancelQueries settles.
			await waitFor( () => {
				const mid = client.getQueryData< FediverseAuthorProfile >( key );
				expect( mid?.viewer?.requested ).toBe( true );
				expect( mid?.viewer?.following ).toBe( false );
			} );

			await act( async () => {
				await inFlight;
			} );
		} );

		it( 'falls back to cached `locked` when vars.locked is omitted', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const key = readerFediverseKeys.authorProfile( 1, 'alice@example.com' );
			client.setQueryData( key, makeProfile( { locked: true } ) );

			nock( BASE )
				.post( '/wpcom/v2/reader/fediverse/connections/1/follows' )
				.delay( 50 )
				.reply( 200, {
					viewer: { following: false, followed_by: false, requested: true },
				} );

			const { result } = renderHook( () => useMutation( followFediverseActorMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			let inFlight: Promise< unknown > | undefined;
			act( () => {
				inFlight = result.current.mutateAsync( {
					connectionId: 1,
					actor: 'alice@example.com',
				} );
			} );

			await waitFor( () => {
				const mid = client.getQueryData< FediverseAuthorProfile >( key );
				expect( mid?.viewer?.requested ).toBe( true );
			} );

			await act( async () => {
				await inFlight;
			} );
		} );

		it( 'rolls back to previous viewer on error', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const key = readerFediverseKeys.authorProfile( 1, 'alice@example.com' );
			client.setQueryData(
				key,
				makeProfile( {
					viewer: { following: false, followed_by: false, requested: false },
				} )
			);

			nock( BASE )
				.post( '/wpcom/v2/reader/fediverse/connections/1/follows' )
				.reply( 502, { code: 'reader_fediverse_upstream_unavailable' } );

			const { result } = renderHook( () => useMutation( followFediverseActorMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			await act( async () => {
				try {
					await result.current.mutateAsync( {
						connectionId: 1,
						actor: 'alice@example.com',
					} );
				} catch {
					// expected
				}
			} );

			const cached = client.getQueryData< FediverseAuthorProfile >( key );
			expect( cached?.viewer?.following ).toBe( false );
			expect( cached?.viewer?.requested ).toBe( false );
		} );

		it( 'commits server `viewer` on success (overrides the optimistic patch)', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const key = readerFediverseKeys.authorProfile( 1, 'alice@example.com' );
			client.setQueryData( key, makeProfile() );

			// Server says "requested" even though we optimistically wrote
			// "following: true" — the locked state changed between the cache
			// snapshot and the server commit.
			nock( BASE )
				.post( '/wpcom/v2/reader/fediverse/connections/1/follows' )
				.reply( 200, {
					viewer: { following: false, followed_by: true, requested: true },
				} );

			const { result } = renderHook( () => useMutation( followFediverseActorMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			await act( async () => {
				await result.current.mutateAsync( {
					connectionId: 1,
					actor: 'alice@example.com',
				} );
			} );

			const cached = client.getQueryData< FediverseAuthorProfile >( key );
			expect( cached?.viewer ).toEqual( {
				following: false,
				followed_by: true,
				requested: true,
			} );
		} );
	} );

	describe( 'unfollowFediverseActorMutation', () => {
		it( 'optimistically clears viewer.following and viewer.requested on unfollow', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const key = readerFediverseKeys.authorProfile( 1, 'alice@example.com' );
			client.setQueryData(
				key,
				makeProfile( {
					locked: true,
					viewer: { following: false, followed_by: false, requested: true },
				} )
			);

			nock( BASE )
				.delete( '/wpcom/v2/reader/fediverse/connections/1/follows/alice%40example.com' )
				.reply( 200, {
					viewer: { following: false, followed_by: false, requested: false },
				} );

			const { result } = renderHook(
				() => useMutation( unfollowFediverseActorMutation( client ) ),
				{ wrapper: makeWrapper( client ) }
			);

			await act( async () => {
				await result.current.mutateAsync( {
					connectionId: 1,
					actor: 'alice@example.com',
				} );
			} );

			const cached = client.getQueryData< FediverseAuthorProfile >( key );
			expect( cached?.viewer?.following ).toBe( false );
			expect( cached?.viewer?.requested ).toBe( false );
		} );

		it( 'rolls back to previous viewer on error', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const key = readerFediverseKeys.authorProfile( 1, 'alice@example.com' );
			client.setQueryData(
				key,
				makeProfile( {
					viewer: { following: true, followed_by: false, requested: false },
				} )
			);

			nock( BASE )
				.delete( '/wpcom/v2/reader/fediverse/connections/1/follows/alice%40example.com' )
				.reply( 502, { code: 'reader_fediverse_upstream_unavailable' } );

			const { result } = renderHook(
				() => useMutation( unfollowFediverseActorMutation( client ) ),
				{ wrapper: makeWrapper( client ) }
			);

			await act( async () => {
				try {
					await result.current.mutateAsync( {
						connectionId: 1,
						actor: 'alice@example.com',
					} );
				} catch {
					// expected
				}
			} );

			const cached = client.getQueryData< FediverseAuthorProfile >( key );
			expect( cached?.viewer?.following ).toBe( true );
			expect( cached?.viewer?.requested ).toBe( false );
		} );
	} );

	describe( 'cache key normalization', () => {
		it( 'follow optimistic patch hits the normalized cache key for webfinger actors', async () => {
			// Profile cache is keyed under the normalized form `alice@example.com`.
			// The caller passes `@Alice@EXAMPLE.com` (mixed-case, leading @); the
			// mutation must hit the same key for the optimistic patch to land.
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const normalizedKey = readerFediverseKeys.authorProfile( 1, 'alice@example.com' );
			client.setQueryData( normalizedKey, makeProfile() );

			nock( BASE )
				.post( '/wpcom/v2/reader/fediverse/connections/1/follows' )
				.reply( 200, {
					viewer: { following: true, followed_by: false, requested: false },
				} );

			const { result } = renderHook( () => useMutation( followFediverseActorMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			await act( async () => {
				await result.current.mutateAsync( {
					connectionId: 1,
					actor: '@Alice@EXAMPLE.com',
				} );
			} );

			const cached = client.getQueryData< FediverseAuthorProfile >( normalizedKey );
			expect( cached?.viewer?.following ).toBe( true );
		} );
	} );
} );

describe( 'normalizeFediverseActor', () => {
	it( 'strips a leading `@` and lowercases webfinger handles', () => {
		expect( normalizeFediverseActor( '@Alice@EXAMPLE.com' ) ).toBe( 'alice@example.com' );
	} );

	it( 'leaves bare webfinger handles unchanged once lowercased', () => {
		expect( normalizeFediverseActor( 'alice@example.com' ) ).toBe( 'alice@example.com' );
	} );

	it( 'preserves URL-shaped actors verbatim (case-sensitive paths)', () => {
		// Lowercasing a URL would change the path component on
		// case-sensitive servers and silently break lookups; URLs round-trip
		// trimmed only.
		expect( normalizeFediverseActor( 'https://Example.com/Users/Alice' ) ).toBe(
			'https://Example.com/Users/Alice'
		);
		expect( normalizeFediverseActor( '  https://example.com/users/alice  ' ) ).toBe(
			'https://example.com/users/alice'
		);
	} );

	it( 'recognises http (not just https) URL-shaped actors', () => {
		expect( normalizeFediverseActor( 'http://Example.com/Users/Bob' ) ).toBe(
			'http://Example.com/Users/Bob'
		);
	} );
} );
