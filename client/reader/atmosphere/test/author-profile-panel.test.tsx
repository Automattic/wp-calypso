/**
 * @jest-environment jsdom
 */
import { readerAtmosphereKeys } from '@automattic/api-core';
import page from '@automattic/calypso-router';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils';
import { ComposerModal, ComposerProvider } from 'calypso/reader/social/composer';
import * as analytics from 'calypso/state/reader/analytics/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { AuthorProfilePanel } from '../author-profile-panel';
import { atmosphereComposerConfig } from '../composer-config';
import type { AtmosphereScopedProfile, AtmosphereConnection } from '@automattic/api-core';

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

const connection: AtmosphereConnection = {
	id: 42,
	did: 'did:plc:viewer',
	handle: 'viewer.bsky.social',
	display_name: 'Viewer',
	avatar: null,
};

const profilePayload: AtmosphereScopedProfile = {
	did: 'did:plc:abc',
	handle: 'alice.bsky.social',
	display_name: 'Alice',
	description: '',
	description_html: '',
	avatar: null,
	banner: null,
	bluesky_url: 'https://bsky.app/profile/alice.bsky.social',
	counts: { followers: 10, follows: 5, posts: 3 },
	viewer: { following: null, following_rkey: null, followed_by: false },
};

const feedItem = {
	uri: 'at://did:plc:abc/app.bsky.feed.post/aaaaaaaaaaaaa',
	cid: 'cid',
	author: {
		did: 'did:plc:abc',
		handle: 'alice.bsky.social',
		display_name: 'Alice',
		avatar: null,
	},
	created_at: '2024-01-01T00:00:00.000Z',
	indexed_at: '2024-01-01T00:00:00.000Z',
	text: 'hello',
	html: '<p>hello</p>',
	lang: [ 'en' ],
	reply_parent: null,
	reply_root: null,
	reason: null,
	embed: null,
	counts: { replies: 0, reposts: 0, likes: 0, quotes: 0 },
	bluesky_url: 'https://bsky.app/profile/alice.bsky.social/post/aaaaaaaaaaaaa',
};

function makeQueryClient() {
	return new QueryClient( {
		defaultOptions: { queries: { retry: false, retryDelay: 0 } },
	} );
}

describe( 'AuthorProfilePanel', () => {
	beforeEach( () => {
		// recordReaderTracksEvent is a thunk that reads state.reader.follows.
		// Replace it with a no-op action creator so dispatch() doesn't throw,
		// while still letting spies observe call-site arguments.
		jest
			.spyOn( analytics, 'recordReaderTracksEvent' )
			.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );
		( page as unknown as jest.Mock ).mockReset();
	} );

	afterEach( () => {
		nock.cleanAll();
		jest.restoreAllMocks();
		// Reset window.location so per-test ?tab= overrides don't leak into
		// the next test's useAuthorProfileFilter() read.
		window.history.replaceState( {}, '', '/' );
	} );

	it( 'renders the header and feed once both queries resolve', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social' )
			.reply( 200, profilePayload );
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social/feed' )
			.query( true )
			.reply( 200, { items: [ feedItem ], cursor: null } );

		renderWithProvider(
			<AuthorProfilePanel
				connection={ connection }
				actor="alice.bsky.social"
				subtabBasePath="/reader/atmosphere/42/profile/alice.bsky.social"
			/>,
			{ queryClient: makeQueryClient() }
		);

		expect( await screen.findByRole( 'heading', { level: 2, name: 'Alice' } ) ).toBeVisible();
		// Both the SocialProfileCard (header) and the SocialPostCard (feed
		// item) render the handle. Assert the profile-card one specifically.
		const handles = screen.getAllByText( '@alice.bsky.social' );
		expect( handles.length ).toBeGreaterThanOrEqual( 1 );
		expect( handles[ 0 ] ).toBeVisible();
		expect( await screen.findByText( 'hello' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: /like, 0 likes/i } ) ).toBeVisible();
	} );

	it( 'does not render the back-to-timeline button (it is owned by the parent view)', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social' )
			.reply( 200, profilePayload );
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social/feed' )
			.query( true )
			.reply( 200, { items: [], cursor: null } );

		renderWithProvider(
			<AuthorProfilePanel
				connection={ connection }
				actor="alice.bsky.social"
				subtabBasePath="/reader/atmosphere/42/profile/alice.bsky.social"
			/>,
			{ queryClient: makeQueryClient() }
		);

		await screen.findByRole( 'heading', { level: 2, name: 'Alice' } );
		expect( screen.queryByRole( 'button', { name: /back/i } ) ).toBeNull();
	} );

	it( 'fires profile_viewed on mount', async () => {
		const spy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social' )
			.reply( 200, profilePayload );
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social/feed' )
			.query( true )
			.reply( 200, { items: [], cursor: null } );

		renderWithProvider(
			<AuthorProfilePanel
				connection={ connection }
				actor="alice.bsky.social"
				subtabBasePath="/reader/atmosphere/42/profile/alice.bsky.social"
			/>,
			{ queryClient: makeQueryClient() }
		);

		await waitFor( () =>
			expect( spy ).toHaveBeenCalledWith(
				'calypso_reader_atmosphere_profile_viewed',
				expect.objectContaining( {
					connection_id: 42,
					actor: 'alice.bsky.social',
				} )
			)
		);
	} );

	it( 'shows a not-found empty state when the profile endpoint 404s', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/missing' )
			.reply( 404, { error: 'atmosphere_not_found' } );
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/missing/feed' )
			.query( true )
			.reply( 404, { error: 'atmosphere_not_found' } );

		renderWithProvider(
			<AuthorProfilePanel
				connection={ connection }
				actor="missing"
				subtabBasePath="/reader/atmosphere/42/profile/missing"
			/>,
			{
				queryClient: makeQueryClient(),
			}
		);

		expect( await screen.findByText( /Profile not found/i ) ).toBeVisible();
	} );

	it( 'allows retry on a 502 error', async () => {
		const user = userEvent.setup();
		// Both the profile and the scoped author feed retry transient
		// upstream_unavailable up to 2 more times (3 total) before surrendering.
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social' )
			.reply( 502, { error: 'atmosphere_upstream_unavailable' } );
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social/feed' )
			.query( true )
			.times( 3 )
			.reply( 502, { error: 'atmosphere_upstream_unavailable' } );

		renderWithProvider(
			<AuthorProfilePanel
				connection={ connection }
				actor="alice.bsky.social"
				subtabBasePath="/reader/atmosphere/42/profile/alice.bsky.social"
			/>,
			{ queryClient: makeQueryClient() }
		);

		// Both the header (EmptyContent) and the feed (FeedListEmpty) render
		// their own Retry button. Wait for both to appear, then click the
		// header retry.
		await screen.findAllByRole( 'button', { name: /retry/i } );
		const retries = screen.getAllByRole( 'button', { name: /retry/i } );
		expect( retries.length ).toBeGreaterThanOrEqual( 1 );

		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social' )
			.reply( 200, profilePayload );
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social/feed' )
			.query( true )
			.reply( 200, { items: [ feedItem ], cursor: null } );

		await user.click( retries[ 0 ] );

		expect( await screen.findByRole( 'heading', { level: 2, name: 'Alice' } ) ).toBeVisible();
	} );

	it( 'paginates when sentinel comes into view', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social' )
			.reply( 200, profilePayload );
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social/feed' )
			.query( ( q ) => ! q.cursor )
			.reply( 200, { items: [ feedItem ], cursor: 'page-2' } );
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social/feed' )
			.query( ( q ) => q.cursor === 'page-2' )
			.reply( 200, {
				items: [
					{
						...feedItem,
						uri: 'at://did:plc:abc/app.bsky.feed.post/bbbbbbbbbbbbb',
						text: 'second',
						html: '<p>second</p>',
					},
				],
				cursor: null,
			} );

		renderWithProvider(
			<AuthorProfilePanel
				connection={ connection }
				actor="alice.bsky.social"
				subtabBasePath="/reader/atmosphere/42/profile/alice.bsky.social"
			/>,
			{ queryClient: makeQueryClient() }
		);

		expect( await screen.findByText( 'hello' ) ).toBeVisible();
		mockAllIsIntersecting( true );
		expect( await screen.findByText( 'second' ) ).toBeVisible();
	} );

	describe( 'filter tabs', () => {
		it( 'fetches the feed with no filter when ?tab is absent', async () => {
			window.history.replaceState( {}, '', '/reader/atmosphere/42/profile/alice.bsky.social' );

			nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social' )
				.reply( 200, profilePayload );
			const feedScope = nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social/feed' )
				.query( ( q ) => ! ( 'filter' in q ) )
				.reply( 200, { items: [ feedItem ], cursor: null } );

			renderWithProvider(
				<AuthorProfilePanel
					connection={ connection }
					actor="alice.bsky.social"
					subtabBasePath="/reader/atmosphere/42/profile/alice.bsky.social"
				/>,
				{ queryClient: makeQueryClient() }
			);
			await waitFor( () => expect( feedScope.isDone() ).toBe( true ) );
		} );

		it( 'fetches the feed with filter=posts_with_replies when ?tab=replies', async () => {
			window.history.replaceState(
				{},
				'',
				'/reader/atmosphere/42/profile/alice.bsky.social?tab=replies'
			);

			nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social' )
				.reply( 200, profilePayload );
			const feedScope = nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social/feed' )
				.query( { filter: 'posts_with_replies' } )
				.reply( 200, { items: [], cursor: null } );

			renderWithProvider(
				<AuthorProfilePanel
					connection={ connection }
					actor="alice.bsky.social"
					subtabBasePath="/reader/atmosphere/42/profile/alice.bsky.social"
				/>,
				{ queryClient: makeQueryClient() }
			);
			await waitFor( () => expect( feedScope.isDone() ).toBe( true ) );
		} );

		it( 'renders three tabs above the feed', async () => {
			window.history.replaceState( {}, '', '/reader/atmosphere/42/profile/alice.bsky.social' );

			nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social' )
				.reply( 200, profilePayload );
			nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social/feed' )
				.query( true )
				.reply( 200, { items: [], cursor: null } );

			renderWithProvider(
				<AuthorProfilePanel
					connection={ connection }
					actor="alice.bsky.social"
					subtabBasePath="/reader/atmosphere/42/profile/alice.bsky.social"
				/>,
				{ queryClient: makeQueryClient() }
			);

			// NavItem renders <a role="menuitem">, not role="link" (verified in
			// the author-profile-tabs tests).
			expect( await screen.findByRole( 'menuitem', { name: 'Posts' } ) ).toBeVisible();
			expect( screen.getByRole( 'menuitem', { name: 'Replies' } ) ).toBeVisible();
			expect( screen.getByRole( 'menuitem', { name: 'Media' } ) ).toBeVisible();
		} );

		it( '_profile_viewed includes initial_filter matching the URL on first paint', async () => {
			window.history.replaceState(
				{},
				'',
				'/reader/atmosphere/42/profile/alice.bsky.social?tab=media'
			);

			nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social' )
				.reply( 200, profilePayload );
			nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social/feed' )
				.query( true )
				.reply( 200, { items: [], cursor: null } );

			renderWithProvider(
				<AuthorProfilePanel
					connection={ connection }
					actor="alice.bsky.social"
					subtabBasePath="/reader/atmosphere/42/profile/alice.bsky.social"
				/>,
				{ queryClient: makeQueryClient() }
			);

			await waitFor( () =>
				expect( analytics.recordReaderTracksEvent ).toHaveBeenCalledWith(
					'calypso_reader_atmosphere_profile_viewed',
					expect.objectContaining( { initial_filter: 'posts_with_media' } )
				)
			);
		} );

		it( '_profile_error_shown for surface=feed includes filter; surface=header does not', async () => {
			window.history.replaceState(
				{},
				'',
				'/reader/atmosphere/42/profile/alice.bsky.social?tab=replies'
			);

			nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social' )
				.reply( 429, { error: 'atmosphere_rate_limited' } );
			nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social/feed' )
				.query( true )
				.reply( 429, { error: 'atmosphere_rate_limited' } );

			renderWithProvider(
				<AuthorProfilePanel
					connection={ connection }
					actor="alice.bsky.social"
					subtabBasePath="/reader/atmosphere/42/profile/alice.bsky.social"
				/>,
				{ queryClient: makeQueryClient() }
			);

			await waitFor( () =>
				expect( analytics.recordReaderTracksEvent ).toHaveBeenCalledWith(
					'calypso_reader_atmosphere_profile_error_shown',
					expect.objectContaining( { surface: 'feed', filter: 'posts_with_replies' } )
				)
			);
			await waitFor( () =>
				expect( analytics.recordReaderTracksEvent ).toHaveBeenCalledWith(
					'calypso_reader_atmosphere_profile_error_shown',
					expect.objectContaining( { surface: 'header' } )
				)
			);
			const headerCall = (
				analytics.recordReaderTracksEvent as unknown as jest.Mock
			 ).mock.calls.find(
				( c ) =>
					c[ 0 ] === 'calypso_reader_atmosphere_profile_error_shown' && c[ 1 ]?.surface === 'header'
			);
			expect( headerCall ).toBeDefined();
			expect( headerCall![ 1 ] ).not.toHaveProperty( 'filter' );
		} );

		it( 'shows per-tab empty title and no "View on Bluesky" action', async () => {
			window.history.replaceState(
				{},
				'',
				'/reader/atmosphere/42/profile/alice.bsky.social?tab=replies'
			);

			nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social' )
				.reply( 200, profilePayload );
			nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social/feed' )
				.query( true )
				.reply( 200, { items: [], cursor: null } );

			renderWithProvider(
				<AuthorProfilePanel
					connection={ connection }
					actor="alice.bsky.social"
					subtabBasePath="/reader/atmosphere/42/profile/alice.bsky.social"
				/>,
				{ queryClient: makeQueryClient() }
			);

			expect( await screen.findByText( /hasn’t replied to anyone yet/i ) ).toBeVisible();
			expect( screen.queryByRole( 'button', { name: /view on bluesky/i } ) ).toBeNull();
			expect( screen.queryByRole( 'link', { name: /view on bluesky/i } ) ).toBeNull();
		} );

		it( 'shows the Media-tab empty title and no "View on Bluesky" action when ?tab=media', async () => {
			window.history.replaceState(
				{},
				'',
				'/reader/atmosphere/42/profile/alice.bsky.social?tab=media'
			);

			nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social' )
				.reply( 200, profilePayload );
			nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social/feed' )
				.query( true )
				.reply( 200, { items: [], cursor: null } );

			renderWithProvider(
				<AuthorProfilePanel
					connection={ connection }
					actor="alice.bsky.social"
					subtabBasePath="/reader/atmosphere/42/profile/alice.bsky.social"
				/>,
				{ queryClient: makeQueryClient() }
			);

			expect( await screen.findByText( /hasn’t posted any media yet/i ) ).toBeVisible();
			expect( screen.queryByRole( 'button', { name: /view on bluesky/i } ) ).toBeNull();
			expect( screen.queryByRole( 'link', { name: /view on bluesky/i } ) ).toBeNull();
		} );
	} );

	describe( 'follow / unfollow', () => {
		it( 'fires _follow_clicked, POSTs to /follows, and optimistically swaps to "Following"', async () => {
			const user = userEvent.setup();
			const spy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
			nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social' )
				.reply( 200, profilePayload );
			nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social/feed' )
				.query( true )
				.reply( 200, { items: [], cursor: null } );
			const followScope = nock( 'https://public-api.wordpress.com' )
				.post( '/wpcom/v2/reader/atmosphere/connections/42/follows', {
					subject_did: 'did:plc:abc',
				} )
				.reply( 201, {
					follow: {
						uri: 'at://did:plc:viewer/app.bsky.graph.follow/3krkeyrkeyrke',
						cid: 'bafy',
						rkey: '3krkeyrkeyrke',
					},
				} );

			renderWithProvider(
				<AuthorProfilePanel
					connection={ connection }
					actor="alice.bsky.social"
					subtabBasePath="/reader/atmosphere/42/profile/alice.bsky.social"
				/>,
				{ queryClient: makeQueryClient() }
			);

			const followButton = await screen.findByRole( 'button', { name: /^follow$/i } );
			await user.click( followButton );

			await waitFor( () => expect( followScope.isDone() ).toBe( true ) );
			expect(
				spy.mock.calls.some(
					( [ event ] ) => event === 'calypso_reader_atmosphere_profile_follow_clicked'
				)
			).toBe( true );
			// Optimistic update flips the cached profile, which re-renders the
			// button into its Following state with the action-aware aria-label.
			expect(
				await screen.findByRole( 'button', { name: /unfollow @alice\.bsky\.social/i } )
			).toBeVisible();
		} );

		it( 'renders "Follow back" when the actor follows the viewer but the viewer doesn’t follow yet', async () => {
			nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social' )
				.reply( 200, {
					...profilePayload,
					viewer: { following: null, following_rkey: null, followed_by: true },
				} );
			nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social/feed' )
				.query( true )
				.reply( 200, { items: [], cursor: null } );

			renderWithProvider(
				<AuthorProfilePanel
					connection={ connection }
					actor="alice.bsky.social"
					subtabBasePath="/reader/atmosphere/42/profile/alice.bsky.social"
				/>,
				{ queryClient: makeQueryClient() }
			);

			expect( await screen.findByRole( 'button', { name: /follow back/i } ) ).toBeVisible();
			expect( screen.queryByRole( 'button', { name: /^follow$/i } ) ).toBeNull();
			expect( screen.queryByRole( 'button', { name: /unfollow/i } ) ).toBeNull();
		} );

		it( 'fires _follow_error with action and error_kind on a 502 follow response', async () => {
			const user = userEvent.setup();
			const spy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
			nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social' )
				.reply( 200, profilePayload );
			nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social/feed' )
				.query( true )
				.reply( 200, { items: [], cursor: null } );
			nock( 'https://public-api.wordpress.com' )
				.post( '/wpcom/v2/reader/atmosphere/connections/42/follows' )
				.reply( 502, { error: 'atmosphere_upstream_unavailable' } );

			renderWithProvider(
				<AuthorProfilePanel
					connection={ connection }
					actor="alice.bsky.social"
					subtabBasePath="/reader/atmosphere/42/profile/alice.bsky.social"
				/>,
				{ queryClient: makeQueryClient() }
			);

			await user.click( await screen.findByRole( 'button', { name: /^follow$/i } ) );

			// _follow_error is the analytics signal Atmosphere uses to track upstream
			// failure rates by error_kind; the toast itself isn't rendered because
			// renderWithProvider doesn't mount the global notice list.
			await waitFor( () =>
				expect(
					spy.mock.calls.some(
						( [ event, props ] ) =>
							event === 'calypso_reader_atmosphere_profile_follow_error' &&
							( props as Record< string, unknown > )?.error_kind === 'upstream_unavailable' &&
							( props as Record< string, unknown > )?.action === 'follow'
					)
				).toBe( true )
			);
		} );

		it( 'does not render the Follow button on the viewer’s own profile', async () => {
			nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/viewer.bsky.social' )
				.reply( 200, {
					...profilePayload,
					did: connection.did,
					handle: 'viewer.bsky.social',
					display_name: 'Viewer',
				} );
			nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/viewer.bsky.social/feed' )
				.query( true )
				.reply( 200, { items: [], cursor: null } );

			renderWithProvider(
				<AuthorProfilePanel
					connection={ connection }
					actor="viewer.bsky.social"
					subtabBasePath="/reader/atmosphere/42/profile/viewer.bsky.social"
				/>,
				{ queryClient: makeQueryClient() }
			);

			expect( await screen.findByRole( 'heading', { level: 2, name: 'Viewer' } ) ).toBeVisible();
			expect( screen.queryByRole( 'button', { name: /^follow$/i } ) ).toBeNull();
			expect( screen.queryByRole( 'button', { name: /follow back/i } ) ).toBeNull();
			expect( screen.queryByRole( 'button', { name: /unfollow/i } ) ).toBeNull();
		} );
	} );

	it( "shows the post-actions kebab on the user's own posts in their author feed", async () => {
		const ownFeedItem = {
			...feedItem,
			author: {
				did: connection.did,
				handle: connection.handle,
				display_name: connection.display_name,
				avatar: null,
			},
		};
		const queryClient = makeQueryClient();
		queryClient.setQueryData(
			readerAtmosphereKeys.scopedProfile( connection.id, connection.handle ),
			{
				...profilePayload,
				did: connection.did,
				handle: connection.handle,
				display_name: connection.display_name,
			}
		);
		queryClient.setQueryData(
			[ ...readerAtmosphereKeys.scopedAuthorFeed( connection.id, connection.handle ) ],
			{
				pages: [ { items: [ ownFeedItem ], cursor: null } ],
				pageParams: [ undefined ],
			}
		);

		renderWithProvider(
			<AuthorProfilePanel
				connection={ connection }
				actor={ connection.handle }
				subtabBasePath={ `/reader/atmosphere/${ connection.id }/profile/${ connection.handle }` }
			/>,
			{ queryClient }
		);

		expect( await screen.findByRole( 'button', { name: /post actions/i } ) ).toBeVisible();
	} );

	it( 'dedupes feed items by uri across pages (Bluesky returns repeats)', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social' )
			.reply( 200, profilePayload );
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social/feed' )
			.query( ( q ) => ! q.cursor )
			.reply( 200, { items: [ feedItem ], cursor: 'page-2' } );
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social/feed' )
			.query( ( q ) => q.cursor === 'page-2' )
			.reply( 200, {
				items: [
					// Same URI as page 1 — would normally duplicate the rendered card
					// and trip React's keyed-list invariant.
					{ ...feedItem, text: 'hello (duplicate)', html: '<p>hello (duplicate)</p>' },
					{
						...feedItem,
						uri: 'at://did:plc:abc/app.bsky.feed.post/cccccccccccc',
						text: 'unique',
						html: '<p>unique</p>',
					},
				],
				cursor: null,
			} );

		renderWithProvider(
			<AuthorProfilePanel
				connection={ connection }
				actor="alice.bsky.social"
				subtabBasePath="/reader/atmosphere/42/profile/alice.bsky.social"
			/>,
			{ queryClient: makeQueryClient() }
		);

		expect( await screen.findByText( 'hello' ) ).toBeVisible();
		mockAllIsIntersecting( true );
		expect( await screen.findByText( 'unique' ) ).toBeVisible();
		// Duplicate URI from page 2 was dropped — only the page-1 occurrence renders.
		expect( screen.queryByText( 'hello (duplicate)' ) ).toBeNull();
	} );
} );

describe( 'AuthorProfilePanel — quote composer integration', () => {
	beforeEach( () => {
		jest
			.spyOn( analytics, 'recordReaderTracksEvent' )
			.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );
		( page as unknown as jest.Mock ).mockReset();
	} );

	afterEach( () => {
		nock.cleanAll();
		jest.restoreAllMocks();
		window.history.replaceState( {}, '', '/' );
	} );

	it( 'opens the composer in quote mode from the author feed', async () => {
		const quotableFeedItem = {
			...feedItem,
			cid: 'pcid',
			counts: { replies: 0, reposts: 0, likes: 0, quotes: 3 },
		};
		const queryClient = makeQueryClient();
		queryClient.setQueryData(
			readerAtmosphereKeys.scopedProfile( connection.id, 'alice.bsky.social' ),
			profilePayload
		);
		queryClient.setQueryData(
			[ ...readerAtmosphereKeys.scopedAuthorFeed( connection.id, 'alice.bsky.social' ) ],
			{
				pages: [ { items: [ quotableFeedItem ], cursor: null } ],
				pageParams: [ undefined ],
			}
		);

		const user = userEvent.setup();
		renderWithProvider(
			<ComposerProvider connectionId={ connection.id } config={ atmosphereComposerConfig }>
				<AuthorProfilePanel
					connection={ connection }
					actor="alice.bsky.social"
					subtabBasePath="/reader/atmosphere/42/profile/alice.bsky.social"
				/>
				<ComposerModal />
			</ComposerProvider>,
			{ queryClient }
		);

		const repostButton = await screen.findByRole( 'button', { name: /repost, 3 reposts/i } );
		await user.click( repostButton );
		const quoteItem = await screen.findByRole( 'menuitem', { name: 'Quote post' } );
		await user.click( quoteItem );
		expect( await screen.findByRole( 'dialog', { name: /quote post/i } ) ).toBeVisible();
	} );
} );
