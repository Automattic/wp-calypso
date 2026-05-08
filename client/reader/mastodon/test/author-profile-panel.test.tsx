/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import * as logstash from 'calypso/lib/logstash';
import * as notices from 'calypso/state/notices/actions';
import * as analytics from 'calypso/state/reader/analytics/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { MastodonAuthorProfilePanel } from '../author-profile-panel';
import type { MastodonAuthorProfile, MastodonConnection } from '@automattic/api-core';

jest.mock( '@automattic/calypso-router', () => jest.fn() );

// `logToLogstash` fires a real HTTPS request — mute it so the
// follow-error path doesn't trigger an unmocked-request alarm in nock.
jest.mock( 'calypso/lib/logstash', () => ( {
	logToLogstash: jest.fn(),
} ) );

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

		renderWithProvider(
			<MastodonAuthorProfilePanel
				connection={ connection }
				actor="108020"
				subtabBasePath="/reader/mastodon/7/profile/108020"
			/>,
			{
				queryClient: makeQueryClient(),
			}
		);

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

		renderWithProvider(
			<MastodonAuthorProfilePanel
				connection={ connection }
				actor="108020"
				subtabBasePath="/reader/mastodon/7/profile/108020"
			/>,
			{
				queryClient: makeQueryClient(),
			}
		);

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

		renderWithProvider(
			<MastodonAuthorProfilePanel
				connection={ connection }
				actor="108020"
				subtabBasePath="/reader/mastodon/7/profile/108020"
			/>,
			{
				queryClient: makeQueryClient(),
			}
		);

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

		renderWithProvider(
			<MastodonAuthorProfilePanel
				connection={ connection }
				actor="108020"
				subtabBasePath="/reader/mastodon/7/profile/108020"
			/>,
			{
				queryClient: makeQueryClient(),
			}
		);

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

		renderWithProvider(
			<MastodonAuthorProfilePanel
				connection={ connection }
				actor="108020"
				subtabBasePath="/reader/mastodon/7/profile/108020"
			/>,
			{
				queryClient: makeQueryClient(),
			}
		);

		await waitFor( () => expect( screen.getByRole( 'heading', { name: 'Alice' } ) ).toBeVisible() );
		await waitFor( () => expect( feedScope.isDone() ).toBe( true ) );
	} );

	describe( 'follow / unfollow button', () => {
		const stubFeed = () =>
			nock( BASE )
				.get( '/wpcom/v2/reader/mastodon/connections/7/profile/108020/feed' )
				.query( { exclude_replies: 'true' } )
				.reply( 200, { items: [], cursor: null } );

		it( 'renders the Follow button when not following and not self', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/mastodon/connections/7/profile/108020' )
				.reply(
					200,
					makeProfile( {
						viewer: { following: false, followed_by: false, requested: false },
						is_self: false,
					} )
				);
			stubFeed();

			renderWithProvider(
				<MastodonAuthorProfilePanel
					connection={ connection }
					actor="108020"
					subtabBasePath="/reader/mastodon/7/profile/108020"
				/>,
				{ queryClient: makeQueryClient() }
			);

			expect( await screen.findByRole( 'button', { name: /^Follow$/ } ) ).toBeVisible();
		} );

		it( 'renders the Following / Unfollow button when viewer.following is true', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/mastodon/connections/7/profile/108020' )
				.reply(
					200,
					makeProfile( {
						viewer: { following: true, followed_by: false, requested: false },
						is_self: false,
					} )
				);
			stubFeed();

			renderWithProvider(
				<MastodonAuthorProfilePanel
					connection={ connection }
					actor="108020"
					subtabBasePath="/reader/mastodon/7/profile/108020"
				/>,
				{ queryClient: makeQueryClient() }
			);

			expect(
				await screen.findByRole( 'button', { name: 'Unfollow @alice@mastodon.social' } )
			).toBeVisible();
		} );

		it( 'renders the Requested button when viewer.requested is true (locked-account pending)', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/mastodon/connections/7/profile/108020' )
				.reply(
					200,
					makeProfile( {
						locked: true,
						viewer: { following: false, followed_by: false, requested: true },
						is_self: false,
					} )
				);
			stubFeed();

			renderWithProvider(
				<MastodonAuthorProfilePanel
					connection={ connection }
					actor="108020"
					subtabBasePath="/reader/mastodon/7/profile/108020"
				/>,
				{ queryClient: makeQueryClient() }
			);

			expect(
				await screen.findByRole( 'button', {
					name: 'Cancel follow request to @alice@mastodon.social',
				} )
			).toBeVisible();
		} );

		it( 'renders Follow back when viewer.followed_by is true', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/mastodon/connections/7/profile/108020' )
				.reply(
					200,
					makeProfile( {
						viewer: { following: false, followed_by: true, requested: false },
						is_self: false,
					} )
				);
			stubFeed();

			renderWithProvider(
				<MastodonAuthorProfilePanel
					connection={ connection }
					actor="108020"
					subtabBasePath="/reader/mastodon/7/profile/108020"
				/>,
				{ queryClient: makeQueryClient() }
			);

			expect( await screen.findByRole( 'button', { name: /^Follow back$/ } ) ).toBeVisible();
			expect( screen.queryByRole( 'button', { name: /^Follow$/ } ) ).toBeNull();
		} );

		it( 'hides the button when is_self is true', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/mastodon/connections/7/profile/108020' )
				.reply(
					200,
					makeProfile( {
						viewer: { following: false, followed_by: false, requested: false },
						is_self: true,
					} )
				);
			stubFeed();

			renderWithProvider(
				<MastodonAuthorProfilePanel
					connection={ connection }
					actor="108020"
					subtabBasePath="/reader/mastodon/7/profile/108020"
				/>,
				{ queryClient: makeQueryClient() }
			);

			await waitFor( () =>
				expect( screen.getByRole( 'heading', { name: 'Alice' } ) ).toBeVisible()
			);
			expect( screen.queryByRole( 'button', { name: /^Follow$/ } ) ).toBeNull();
			expect( screen.queryByRole( 'button', { name: /^Follow back$/ } ) ).toBeNull();
			expect( screen.queryByRole( 'button', { name: /Unfollow/ } ) ).toBeNull();
		} );

		it( 'hides the button when viewer is undefined (forwards-compat for pre-deploy backends)', async () => {
			// No `viewer` and no `is_self` — old backend shape.
			nock( BASE )
				.get( '/wpcom/v2/reader/mastodon/connections/7/profile/108020' )
				.reply( 200, makeProfile() );
			stubFeed();

			renderWithProvider(
				<MastodonAuthorProfilePanel
					connection={ connection }
					actor="108020"
					subtabBasePath="/reader/mastodon/7/profile/108020"
				/>,
				{ queryClient: makeQueryClient() }
			);

			await waitFor( () =>
				expect( screen.getByRole( 'heading', { name: 'Alice' } ) ).toBeVisible()
			);
			expect( screen.queryByRole( 'button', { name: /^Follow$/ } ) ).toBeNull();
			expect( screen.queryByRole( 'button', { name: /^Follow back$/ } ) ).toBeNull();
			expect( screen.queryByRole( 'button', { name: /Unfollow/ } ) ).toBeNull();
		} );

		it( 'POSTs to /follows on click and switches to the Following state', async () => {
			const user = userEvent.setup();
			const spy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
			nock( BASE )
				.get( '/wpcom/v2/reader/mastodon/connections/7/profile/108020' )
				.reply(
					200,
					makeProfile( {
						viewer: { following: false, followed_by: false, requested: false },
						is_self: false,
					} )
				);
			stubFeed();
			const followScope = nock( BASE )
				.post( '/wpcom/v2/reader/mastodon/connections/7/follows', { account_id: '108020' } )
				.reply( 200, { viewer: { following: true, followed_by: false, requested: false } } );

			renderWithProvider(
				<MastodonAuthorProfilePanel
					connection={ connection }
					actor="108020"
					subtabBasePath="/reader/mastodon/7/profile/108020"
				/>,
				{ queryClient: makeQueryClient() }
			);

			const followButton = await screen.findByRole( 'button', { name: /^Follow$/ } );
			await user.click( followButton );

			await waitFor( () => expect( followScope.isDone() ).toBe( true ) );
			// The Tracks fan-out is the analytics contract for the slice. Assert
			// the full payload — connection_id, account_id, was_locked,
			// was_followed_by — not just the event name.
			expect( spy.mock.calls ).toContainEqual( [
				'calypso_reader_mastodon_profile_follow_clicked',
				{
					connection_id: 7,
					account_id: '108020',
					was_followed_by: false,
					was_locked: false,
				},
			] );
			expect(
				await screen.findByRole( 'button', { name: 'Unfollow @alice@mastodon.social' } )
			).toBeVisible();
		} );

		it( 'flows was_locked: true through to the follow_clicked Tracks payload for locked accounts', async () => {
			const user = userEvent.setup();
			const spy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
			nock( BASE )
				.get( '/wpcom/v2/reader/mastodon/connections/7/profile/108020' )
				.reply(
					200,
					makeProfile( {
						locked: true,
						viewer: { following: false, followed_by: false, requested: false },
						is_self: false,
					} )
				);
			stubFeed();
			nock( BASE )
				.post( '/wpcom/v2/reader/mastodon/connections/7/follows', { account_id: '108020' } )
				.reply( 200, { viewer: { following: false, followed_by: false, requested: true } } );

			renderWithProvider(
				<MastodonAuthorProfilePanel
					connection={ connection }
					actor="108020"
					subtabBasePath="/reader/mastodon/7/profile/108020"
				/>,
				{ queryClient: makeQueryClient() }
			);

			await user.click( await screen.findByRole( 'button', { name: /^Follow$/ } ) );

			await waitFor( () =>
				expect( spy.mock.calls ).toContainEqual( [
					'calypso_reader_mastodon_profile_follow_clicked',
					{
						connection_id: 7,
						account_id: '108020',
						was_followed_by: false,
						was_locked: true,
					},
				] )
			);
		} );

		it( 'DELETEs /follows on Unfollow click and switches back to Follow with unfollow_clicked Tracks payload', async () => {
			const user = userEvent.setup();
			const spy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
			const removeSpy = jest.spyOn( notices, 'removeNotice' );
			nock( BASE )
				.get( '/wpcom/v2/reader/mastodon/connections/7/profile/108020' )
				.reply(
					200,
					makeProfile( {
						viewer: { following: true, followed_by: false, requested: false },
						is_self: false,
					} )
				);
			stubFeed();
			const unfollowScope = nock( BASE )
				.delete( '/wpcom/v2/reader/mastodon/connections/7/follows/108020' )
				.reply( 200, { viewer: { following: false, followed_by: false, requested: false } } );

			renderWithProvider(
				<MastodonAuthorProfilePanel
					connection={ connection }
					actor="108020"
					subtabBasePath="/reader/mastodon/7/profile/108020"
				/>,
				{ queryClient: makeQueryClient() }
			);

			await user.click(
				await screen.findByRole( 'button', { name: 'Unfollow @alice@mastodon.social' } )
			);

			await waitFor( () => expect( unfollowScope.isDone() ).toBe( true ) );
			expect( spy.mock.calls ).toContainEqual( [
				'calypso_reader_mastodon_profile_unfollow_clicked',
				{
					connection_id: 7,
					account_id: '108020',
					was_requested: false,
				},
			] );
			expect( await screen.findByRole( 'button', { name: /^Follow$/ } ) ).toBeVisible();
			expect( removeSpy ).toHaveBeenCalledWith( 'mastodon-follow-error' );
		} );

		it( 'cancels a pending follow request and emits was_requested: true when clicking Cancel', async () => {
			const user = userEvent.setup();
			const spy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
			nock( BASE )
				.get( '/wpcom/v2/reader/mastodon/connections/7/profile/108020' )
				.reply(
					200,
					makeProfile( {
						locked: true,
						viewer: { following: false, followed_by: false, requested: true },
						is_self: false,
					} )
				);
			stubFeed();
			const unfollowScope = nock( BASE )
				.delete( '/wpcom/v2/reader/mastodon/connections/7/follows/108020' )
				.reply( 200, { viewer: { following: false, followed_by: false, requested: false } } );

			renderWithProvider(
				<MastodonAuthorProfilePanel
					connection={ connection }
					actor="108020"
					subtabBasePath="/reader/mastodon/7/profile/108020"
				/>,
				{ queryClient: makeQueryClient() }
			);

			await user.click(
				await screen.findByRole( 'button', {
					name: 'Cancel follow request to @alice@mastodon.social',
				} )
			);

			await waitFor( () => expect( unfollowScope.isDone() ).toBe( true ) );
			expect( spy.mock.calls ).toContainEqual( [
				'calypso_reader_mastodon_profile_unfollow_clicked',
				{
					connection_id: 7,
					account_id: '108020',
					was_requested: true,
				},
			] );
		} );

		it( 'fires _follow_error with action: unfollow on a 502 unfollow response', async () => {
			const user = userEvent.setup();
			const tracksSpy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
			const noticeSpy = jest.spyOn( notices, 'errorNotice' );
			nock( BASE )
				.get( '/wpcom/v2/reader/mastodon/connections/7/profile/108020' )
				.reply(
					200,
					makeProfile( {
						viewer: { following: true, followed_by: false, requested: false },
						is_self: false,
					} )
				);
			stubFeed();
			nock( BASE )
				.delete( '/wpcom/v2/reader/mastodon/connections/7/follows/108020' )
				.reply( 502, { code: 'reader_mastodon_upstream_unavailable' } );

			renderWithProvider(
				<MastodonAuthorProfilePanel
					connection={ connection }
					actor="108020"
					subtabBasePath="/reader/mastodon/7/profile/108020"
				/>,
				{ queryClient: makeQueryClient() }
			);

			await user.click(
				await screen.findByRole( 'button', { name: 'Unfollow @alice@mastodon.social' } )
			);

			await waitFor( () =>
				expect(
					tracksSpy.mock.calls.some(
						( [ event, props ] ) =>
							event === 'calypso_reader_mastodon_profile_follow_error' &&
							( props as Record< string, unknown > )?.action === 'unfollow' &&
							( props as Record< string, unknown > )?.error_kind === 'upstream_unavailable'
					)
				).toBe( true )
			);
			// 502 falls through to the shared `errorMessage` — only `not_found`
			// uses the unfollow-specific copy. Assert the error notice fired with
			// the `mastodon-follow-error` id (any message), and that the Logstash
			// `type` discriminator carries the `unfollow` action.
			expect( noticeSpy ).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining( { id: 'mastodon-follow-error' } )
			);
			expect( logstash.logToLogstash ).toHaveBeenCalledWith(
				expect.objectContaining( {
					extra: expect.objectContaining( {
						type: 'reader_mastodon_unfollow_mutation_error',
					} ),
				} )
			);
		} );

		it( 'shows the unfollow-specific not_found copy on a 404 unfollow response', async () => {
			const user = userEvent.setup();
			const noticeSpy = jest.spyOn( notices, 'errorNotice' );
			nock( BASE )
				.get( '/wpcom/v2/reader/mastodon/connections/7/profile/108020' )
				.reply(
					200,
					makeProfile( {
						viewer: { following: true, followed_by: false, requested: false },
						is_self: false,
					} )
				);
			stubFeed();
			nock( BASE )
				.delete( '/wpcom/v2/reader/mastodon/connections/7/follows/108020' )
				.reply( 404, { code: 'reader_mastodon_not_found' } );

			renderWithProvider(
				<MastodonAuthorProfilePanel
					connection={ connection }
					actor="108020"
					subtabBasePath="/reader/mastodon/7/profile/108020"
				/>,
				{ queryClient: makeQueryClient() }
			);

			await user.click(
				await screen.findByRole( 'button', { name: 'Unfollow @alice@mastodon.social' } )
			);

			await waitFor( () =>
				expect( noticeSpy ).toHaveBeenCalledWith(
					'Couldn’t unfollow this account.',
					expect.objectContaining( { id: 'mastodon-follow-error' } )
				)
			);
		} );

		it( 'fires _follow_error and an errorNotice toast on a 502 follow response', async () => {
			const user = userEvent.setup();
			const tracksSpy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
			const noticeSpy = jest.spyOn( notices, 'errorNotice' );
			nock( BASE )
				.get( '/wpcom/v2/reader/mastodon/connections/7/profile/108020' )
				.reply(
					200,
					makeProfile( {
						viewer: { following: false, followed_by: false, requested: false },
						is_self: false,
					} )
				);
			stubFeed();
			const followScope = nock( BASE )
				.post( '/wpcom/v2/reader/mastodon/connections/7/follows', { account_id: '108020' } )
				.reply( 502, { code: 'reader_mastodon_upstream_unavailable' } );

			renderWithProvider(
				<MastodonAuthorProfilePanel
					connection={ connection }
					actor="108020"
					subtabBasePath="/reader/mastodon/7/profile/108020"
				/>,
				{ queryClient: makeQueryClient() }
			);

			await user.click( await screen.findByRole( 'button', { name: /^Follow$/ } ) );

			await waitFor( () => expect( followScope.isDone() ).toBe( true ) );
			// _follow_error is the analytics signal Mastodon uses to track upstream
			// failure rates by error_kind; the toast itself isn't rendered because
			// renderWithProvider doesn't mount the global notice list — assert on
			// the action creator dispatch instead.
			await waitFor( () =>
				expect(
					tracksSpy.mock.calls.some(
						( [ event, props ] ) =>
							event === 'calypso_reader_mastodon_profile_follow_error' &&
							( props as Record< string, unknown > )?.error_kind === 'upstream_unavailable' &&
							( props as Record< string, unknown > )?.action === 'follow'
					)
				).toBe( true )
			);
			expect( noticeSpy ).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining( { id: 'mastodon-follow-error' } )
			);
			// Pipeline-level log so failures stay observable in dashboards
			// even when no Tracks dashboard is consulted.
			expect( logstash.logToLogstash ).toHaveBeenCalledWith(
				expect.objectContaining( {
					feature: 'calypso_client',
					severity: 'error',
					extra: expect.objectContaining( {
						type: 'reader_mastodon_follow_mutation_error',
						connection_id: 7,
						account_id: '108020',
						error_kind: 'upstream_unavailable',
					} ),
				} )
			);
		} );

		it( 'shows the follow-specific not_found copy on a 404', async () => {
			const user = userEvent.setup();
			const noticeSpy = jest.spyOn( notices, 'errorNotice' );
			nock( BASE )
				.get( '/wpcom/v2/reader/mastodon/connections/7/profile/108020' )
				.reply(
					200,
					makeProfile( {
						viewer: { following: false, followed_by: false, requested: false },
						is_self: false,
					} )
				);
			stubFeed();
			nock( BASE )
				.post( '/wpcom/v2/reader/mastodon/connections/7/follows', { account_id: '108020' } )
				.reply( 404, { code: 'reader_mastodon_not_found' } );

			renderWithProvider(
				<MastodonAuthorProfilePanel
					connection={ connection }
					actor="108020"
					subtabBasePath="/reader/mastodon/7/profile/108020"
				/>,
				{ queryClient: makeQueryClient() }
			);

			await user.click( await screen.findByRole( 'button', { name: /^Follow$/ } ) );

			await waitFor( () =>
				expect( noticeSpy ).toHaveBeenCalledWith(
					'Couldn’t follow this account.',
					expect.objectContaining( { id: 'mastodon-follow-error' } )
				)
			);
		} );

		it( 'clears the stale follow-error toast on a successful retry', async () => {
			const user = userEvent.setup();
			const removeSpy = jest.spyOn( notices, 'removeNotice' );
			nock( BASE )
				.get( '/wpcom/v2/reader/mastodon/connections/7/profile/108020' )
				.reply(
					200,
					makeProfile( {
						viewer: { following: false, followed_by: false, requested: false },
						is_self: false,
					} )
				);
			stubFeed();
			// First click 502s; second click succeeds — the success path
			// should fire `removeNotice('mastodon-follow-error')` so the
			// stale error toast doesn't outlive the retry.
			nock( BASE )
				.post( '/wpcom/v2/reader/mastodon/connections/7/follows', { account_id: '108020' } )
				.reply( 502, { code: 'reader_mastodon_upstream_unavailable' } );
			nock( BASE )
				.post( '/wpcom/v2/reader/mastodon/connections/7/follows', { account_id: '108020' } )
				.reply( 200, { viewer: { following: true, followed_by: false, requested: false } } );

			renderWithProvider(
				<MastodonAuthorProfilePanel
					connection={ connection }
					actor="108020"
					subtabBasePath="/reader/mastodon/7/profile/108020"
				/>,
				{ queryClient: makeQueryClient() }
			);

			await user.click( await screen.findByRole( 'button', { name: /^Follow$/ } ) );
			// Wait for the panel to settle back to the Follow button after
			// the optimistic patch rolls back, then click again.
			await screen.findByRole( 'button', { name: /^Follow$/ } );
			await user.click( screen.getByRole( 'button', { name: /^Follow$/ } ) );

			await waitFor( () => expect( removeSpy ).toHaveBeenCalledWith( 'mastodon-follow-error' ) );
		} );
	} );
} );
