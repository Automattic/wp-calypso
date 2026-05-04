/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import * as analytics from 'calypso/state/reader/analytics/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { MastodonAuthorProfilePanel } from '../author-profile-panel';
import type { MastodonAuthorProfile, MastodonConnection } from '@automattic/api-core';

jest.mock( '@automattic/calypso-router', () => jest.fn() );

// NavTabs (rendered via MastodonAuthorProfileTabs inside the panel) uses
// IntersectionObserver, which jsdom doesn't provide.
beforeAll( () => {
	global.IntersectionObserver = class IntersectionObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	} as unknown as typeof global.IntersectionObserver;
} );

afterAll( () => {
	// @ts-expect-error -- cleaning up the stub
	delete global.IntersectionObserver;
} );

const BASE = 'https://public-api.wordpress.com';

const connection: MastodonConnection = {
	id: 7,
	handle: '@me@mastodon.social',
	instance: 'mastodon.social',
	display_name: 'Me',
	avatar: null,
};

function makeProfile( overrides: Partial< MastodonAuthorProfile > = {} ): MastodonAuthorProfile {
	return {
		id: '108020',
		acct: 'alice@mastodon.social',
		display_name: 'Alice',
		avatar: null,
		header: null,
		note: '',
		counts: { followers: 12, following: 34, posts: 56 },
		locked: false,
		raw: {},
		...overrides,
	};
}

function makeQueryClient() {
	return new QueryClient( { defaultOptions: { queries: { retry: false } } } );
}

describe( 'MastodonAuthorProfilePanel', () => {
	beforeEach( () => {
		// recordReaderTracksEvent is a thunk that reads state.reader.follows.
		// Replace it with a no-op action creator so dispatch() doesn't throw,
		// while letting spies observe call-site arguments.
		jest
			.spyOn( analytics, 'recordReaderTracksEvent' )
			.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );
	} );

	afterEach( () => {
		nock.cleanAll();
		jest.restoreAllMocks();
		// Reset URL between tests so a previous test's `?tab=` doesn't leak
		// into the useTabSlug hook on the next render.
		window.history.replaceState( {}, '', '/' );
	} );

	it( 'renders the mapped profile and feed counts', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/profile/108020' )
			.reply( 200, makeProfile() );
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/profile/108020/feed' )
			.query( { exclude_replies: 'true' } )
			.reply( 200, { items: [], cursor: null } );

		renderWithProvider( <MastodonAuthorProfilePanel connection={ connection } actor="108020" />, {
			queryClient: makeQueryClient(),
		} );

		await waitFor( () => expect( screen.getByRole( 'heading', { name: 'Alice' } ) ).toBeVisible() );
		// Profile counts render through SocialProfileCard's stats list.
		expect( screen.getByText( '12' ) ).toBeVisible();
		expect( screen.getByText( '34' ) ).toBeVisible();
		expect( screen.getByText( '56' ) ).toBeVisible();
	} );

	it( 'fires profile_viewed exactly once with actor_id + actor_handle', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/profile/108020' )
			.reply( 200, makeProfile() );
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/profile/108020/feed' )
			.query( { exclude_replies: 'true' } )
			.reply( 200, { items: [], cursor: null } );

		renderWithProvider( <MastodonAuthorProfilePanel connection={ connection } actor="108020" />, {
			queryClient: makeQueryClient(),
		} );

		await waitFor( () => {
			const viewedCalls = (
				analytics.recordReaderTracksEvent as unknown as jest.Mock
			 ).mock.calls.filter( ( c ) => c[ 0 ] === 'calypso_reader_mastodon_profile_viewed' );
			expect( viewedCalls ).toHaveLength( 1 );
			expect( viewedCalls[ 0 ][ 1 ] ).toMatchObject( {
				connection_id: 7,
				actor: '108020',
				actor_id: '108020',
				actor_handle: 'alice@mastodon.social',
			} );
		} );
	} );

	it( 'shows the "private" empty copy on a locked profile with an empty feed', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/profile/108020' )
			.reply( 200, makeProfile( { locked: true } ) );
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/profile/108020/feed' )
			.query( { exclude_replies: 'true' } )
			.reply( 200, { items: [], cursor: null } );

		renderWithProvider( <MastodonAuthorProfilePanel connection={ connection } actor="108020" />, {
			queryClient: makeQueryClient(),
		} );

		await waitFor( () => expect( screen.getByText( /posts are private/i ) ).toBeVisible() );
	} );

	it( 'does NOT show the "private" copy when the feed is in an error state', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/profile/108020' )
			.reply( 200, makeProfile( { locked: true } ) );
		// `connection_not_found` is terminal (no retry) so the test settles
		// quickly. The empty-state branch should NOT pick "private" — the feed
		// isn't actually empty, it errored.
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/profile/108020/feed' )
			.query( { exclude_replies: 'true' } )
			.reply( 404, { error: 'connection_not_found' } );

		renderWithProvider( <MastodonAuthorProfilePanel connection={ connection } actor="108020" />, {
			queryClient: makeQueryClient(),
		} );

		await waitFor( () => expect( screen.getByRole( 'heading', { name: 'Alice' } ) ).toBeVisible() );
		// Give the feed query a moment to settle into the error state.
		await waitFor( () =>
			expect(
				( analytics.recordReaderTracksEvent as unknown as jest.Mock ).mock.calls.some(
					( c ) =>
						c[ 0 ] === 'calypso_reader_mastodon_profile_error_shown' && c[ 1 ].surface === 'feed'
				)
			).toBe( true )
		);
		expect( screen.queryByText( /posts are private/i ) ).toBeNull();
	} );

	it( 'flows ?tab=media through to the feed query as only_media=true', async () => {
		window.history.replaceState( {}, '', '/reader/mastodon/7/profile/108020?tab=media' );
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/profile/108020' )
			.reply( 200, makeProfile() );
		const feedScope = nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/profile/108020/feed' )
			.query( { only_media: 'true' } )
			.reply( 200, { items: [], cursor: null } );

		renderWithProvider( <MastodonAuthorProfilePanel connection={ connection } actor="108020" />, {
			queryClient: makeQueryClient(),
		} );

		await waitFor( () => expect( screen.getByRole( 'heading', { name: 'Alice' } ) ).toBeVisible() );
		await waitFor( () => expect( feedScope.isDone() ).toBe( true ) );
	} );
} );
