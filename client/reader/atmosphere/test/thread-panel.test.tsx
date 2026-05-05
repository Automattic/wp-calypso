/**
 * @jest-environment jsdom
 */
import { readerAtmosphereKeys } from '@automattic/api-core';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import * as analytics from 'calypso/state/reader/analytics/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ComposerModal, ComposerProvider } from '../composer';
import { ThreadPanel } from '../thread-panel';
import type { AtmosphereConnection, AtmosphereThreadResponse } from '@automattic/api-core';

// `page()` from @automattic/calypso-router pokes at window.history in a way
// jsdom doesn't fully implement. Mock it so the Back-button click handler
// in ThreadHeader can run without exploding inside the dispatched event.
jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

const connection: AtmosphereConnection = {
	id: 7,
	did: 'did:plc:viewer',
	handle: 'viewer.bsky.social',
	display_name: 'Viewer',
	avatar: null,
};

const BASE = 'https://public-api.wordpress.com';
const PATH = `/wpcom/v2/reader/atmosphere/connections/${ connection.id }/thread`;

const DID = 'did:plc:abc234567defghi234567jkl';
const RKEY = '3kabcdefghijk';
const TARGET_URI = `at://${ DID }/app.bsky.feed.post/${ RKEY }`;

function fixture(): AtmosphereThreadResponse {
	return {
		thread: {
			type: 'post',
			post: {
				uri: TARGET_URI,
				cid: 'c',
				author: {
					did: DID,
					handle: 'jane.bsky.social',
					display_name: 'Jane Doe',
					avatar: null,
				},
				created_at: '2026-04-28T10:00:00Z',
				indexed_at: '2026-04-28T10:00:00Z',
				text: 'hello world',
				html: '<p>hello world</p>',
				lang: [ 'en' ],
				reply_parent: null,
				reply_root: null,
				reason: null,
				embed: null,
				counts: { replies: 0, reposts: 0, likes: 0, quotes: 0 },
				bluesky_url: 'https://bsky.app/profile/jane.bsky.social/post/3kabcdefghijk',
			},
			parent: null,
			replies: [],
		},
	};
}

function makeQueryClient() {
	return new QueryClient( {
		defaultOptions: { queries: { retry: false, retryDelay: 0 } },
	} );
}

describe( 'ThreadPanel', () => {
	beforeEach( () => {
		// recordReaderTracksEvent is a thunk that reads state.reader.follows.
		// Replace it with a no-op action creator so dispatch() doesn't throw,
		// while still letting spies observe call-site arguments.
		jest
			.spyOn( analytics, 'recordReaderTracksEvent' )
			.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );
	} );

	afterEach( () => {
		nock.cleanAll();
		jest.restoreAllMocks();
	} );

	it( 'renders skeleton then the thread tree on success', async () => {
		nock( BASE ).get( PATH ).query( { uri: TARGET_URI } ).reply( 200, fixture() );

		const { container } = renderWithProvider(
			<ThreadPanel connection={ connection } did={ DID } rkey={ RKEY } />,
			{ queryClient: makeQueryClient() }
		);
		expect( container.querySelectorAll( '.thread-tree-skeleton__row' ).length ).toBeGreaterThan(
			0
		);
		await waitFor( () => expect( screen.getByText( 'hello world' ) ).toBeVisible() );
		expect( screen.getByRole( 'button', { name: /like, 0 likes/i } ) ).toBeVisible();
	} );

	it( 'renders the not_found tombstone when root.type === "not_found"', async () => {
		nock( BASE )
			.get( PATH )
			.query( { uri: TARGET_URI } )
			.reply( 200, {
				thread: { type: 'not_found', uri: TARGET_URI },
			} );

		renderWithProvider( <ThreadPanel connection={ connection } did={ DID } rkey={ RKEY } />, {
			queryClient: makeQueryClient(),
		} );
		await waitFor( () =>
			expect( screen.getAllByText( /Post unavailable/i ).length ).toBeGreaterThan( 0 )
		);
	} );

	it( 'renders auth_required error with no Retry button', async () => {
		nock( BASE )
			.get( PATH )
			.query( { uri: TARGET_URI } )
			.reply( 401, { error: 'atmosphere_auth_required', message: 'auth required' } );

		renderWithProvider( <ThreadPanel connection={ connection } did={ DID } rkey={ RKEY } />, {
			queryClient: makeQueryClient(),
		} );
		await waitFor( () =>
			expect( screen.getAllByText( /Reconnect needed/i ).length ).toBeGreaterThan( 0 )
		);
		expect( screen.queryByRole( 'button', { name: /retry/i } ) ).toBeNull();
	} );

	it( 'renders not_found error with no Retry button', async () => {
		nock( BASE )
			.get( PATH )
			.query( { uri: TARGET_URI } )
			.reply( 404, { error: 'atmosphere_not_found', message: 'not found' } );

		renderWithProvider( <ThreadPanel connection={ connection } did={ DID } rkey={ RKEY } />, {
			queryClient: makeQueryClient(),
		} );
		await waitFor( () =>
			expect( screen.getAllByText( /Thread not found/i ).length ).toBeGreaterThan( 0 )
		);
		expect( screen.queryByRole( 'button', { name: /retry/i } ) ).toBeNull();
	} );

	it( 'renders the Reconnect-needed empty state for invalid_handle / invalid_credentials / auth_failed', async () => {
		nock( BASE )
			.get( PATH )
			.query( { uri: TARGET_URI } )
			.reply( 401, { error: 'auth_failed', message: 'auth failed' } );

		renderWithProvider( <ThreadPanel connection={ connection } did={ DID } rkey={ RKEY } />, {
			queryClient: makeQueryClient(),
		} );
		await waitFor( () =>
			expect( screen.getAllByText( /Reconnect needed/i ).length ).toBeGreaterThan( 0 )
		);
		expect( screen.queryByRole( 'button', { name: /retry/i } ) ).toBeNull();
	} );

	it( 'renders the Connection-no-longer-exists empty state for connection_not_found', async () => {
		nock( BASE )
			.get( PATH )
			.query( { uri: TARGET_URI } )
			.reply( 404, { error: 'connection_not_found', message: 'gone' } );

		renderWithProvider( <ThreadPanel connection={ connection } did={ DID } rkey={ RKEY } />, {
			queryClient: makeQueryClient(),
		} );
		await waitFor( () =>
			expect( screen.getAllByText( /Connection no longer exists/i ).length ).toBeGreaterThan( 0 )
		);
		expect( screen.queryByRole( 'button', { name: /retry/i } ) ).toBeNull();
	} );

	it( 'renders the rate-limited empty state with the retry-after seconds', async () => {
		nock( BASE )
			.get( PATH )
			.query( { uri: TARGET_URI } )
			.reply( 429, {
				error: 'atmosphere_rate_limited',
				data: { retry_after: 30 },
			} );

		renderWithProvider( <ThreadPanel connection={ connection } did={ DID } rkey={ RKEY } />, {
			queryClient: makeQueryClient(),
		} );
		expect( await screen.findByRole( 'heading', { level: 2, name: 'Slow down' } ) ).toBeVisible();
		expect( screen.getByText( /30 seconds/i ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: /retry/i } ) ).toBeVisible();
	} );

	it( 'renders the rate-limited empty state with a singular second when retry_after is 1', async () => {
		nock( BASE )
			.get( PATH )
			.query( { uri: TARGET_URI } )
			.reply( 429, {
				error: 'atmosphere_rate_limited',
				data: { retry_after: 1 },
			} );

		renderWithProvider( <ThreadPanel connection={ connection } did={ DID } rkey={ RKEY } />, {
			queryClient: makeQueryClient(),
		} );
		expect( await screen.findByRole( 'heading', { level: 2, name: 'Slow down' } ) ).toBeVisible();
		expect( screen.getByText( /1 second\./i ) ).toBeVisible();
	} );

	it( 'renders the rate-limited empty state without retry-after when none was provided', async () => {
		nock( BASE )
			.get( PATH )
			.query( { uri: TARGET_URI } )
			.reply( 429, { error: 'atmosphere_rate_limited' } );

		renderWithProvider( <ThreadPanel connection={ connection } did={ DID } rkey={ RKEY } />, {
			queryClient: makeQueryClient(),
		} );
		expect( await screen.findByRole( 'heading', { level: 2, name: 'Slow down' } ) ).toBeVisible();
		expect( screen.getByText( /Try again in a moment/i ) ).toBeVisible();
	} );

	it( 'renders bad_request with backend message when present and no Retry button', async () => {
		nock( BASE ).get( PATH ).query( { uri: TARGET_URI } ).reply( 400, {
			error: 'atmosphere_bad_request',
			message: 'AT-URI parser rejected the input.',
		} );

		renderWithProvider( <ThreadPanel connection={ connection } did={ DID } rkey={ RKEY } />, {
			queryClient: makeQueryClient(),
		} );
		await waitFor( () =>
			expect( screen.getByText( /AT-URI parser rejected the input/i ) ).toBeVisible()
		);
		expect( screen.queryByRole( 'button', { name: /retry/i } ) ).toBeNull();
	} );

	it( 'renders the blocked tombstone when root.type === "blocked"', async () => {
		nock( BASE )
			.get( PATH )
			.query( { uri: TARGET_URI } )
			.reply( 200, {
				thread: {
					type: 'blocked',
					uri: TARGET_URI,
					author: { did: 'did:plc:blocked' },
				},
			} );

		renderWithProvider( <ThreadPanel connection={ connection } did={ DID } rkey={ RKEY } />, {
			queryClient: makeQueryClient(),
		} );
		await waitFor( () =>
			expect( screen.getAllByText( /blocked author/i ).length ).toBeGreaterThan( 0 )
		);
	} );

	it( 'renders the generic Retry empty state for unrecognized error kinds', async () => {
		// Send an `unknown` error (classifier maps unrecognized payloads to
		// kind: 'unknown', which falls through the renderError switch's default).
		nock( BASE )
			.get( PATH )
			.query( { uri: TARGET_URI } )
			.times( 3 )
			.reply( 500, { error: 'something_unrecognized', message: 'oops' } );

		renderWithProvider( <ThreadPanel connection={ connection } did={ DID } rkey={ RKEY } />, {
			queryClient: makeQueryClient(),
		} );
		await waitFor( () => expect( screen.getByText( /Couldn't load thread/i ) ).toBeVisible() );
		expect( screen.getByRole( 'button', { name: /retry/i } ) ).toBeVisible();
	} );

	it( 'renders upstream_unavailable with Retry, fires error_shown + retry_clicked, recovers', async () => {
		const spy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
		// Retry predicate retries upstream_unavailable up to 2 more times
		// (3 total) before surrendering to the error UI.
		nock( BASE )
			.get( PATH )
			.query( { uri: TARGET_URI } )
			.times( 3 )
			.reply( 502, { error: 'atmosphere_upstream_unavailable', message: 'down' } );

		const user = userEvent.setup();
		renderWithProvider( <ThreadPanel connection={ connection } did={ DID } rkey={ RKEY } />, {
			queryClient: makeQueryClient(),
		} );
		await waitFor( () =>
			expect( screen.getAllByText( /unreachable/i ).length ).toBeGreaterThan( 0 )
		);
		expect( spy ).toHaveBeenCalledWith(
			'calypso_reader_atmosphere_thread_error_shown',
			expect.objectContaining( {
				connection_id: 7,
				thread_target_uri: TARGET_URI,
				error_kind: 'upstream_unavailable',
			} )
		);

		nock( BASE ).get( PATH ).query( { uri: TARGET_URI } ).reply( 200, fixture() );
		await user.click( screen.getByRole( 'button', { name: /retry/i } ) );
		await waitFor( () => expect( screen.getByText( 'hello world' ) ).toBeVisible() );
		expect( spy ).toHaveBeenCalledWith(
			'calypso_reader_atmosphere_thread_retry_clicked',
			expect.objectContaining( {
				connection_id: 7,
				thread_target_uri: TARGET_URI,
				error_kind: 'upstream_unavailable',
			} )
		);
	} );

	it( 'fires thread_viewed on mount and back_to_timeline_clicked on Back button click', async () => {
		const spy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
		nock( BASE ).get( PATH ).query( { uri: TARGET_URI } ).reply( 200, fixture() );

		const user = userEvent.setup();
		renderWithProvider( <ThreadPanel connection={ connection } did={ DID } rkey={ RKEY } />, {
			queryClient: makeQueryClient(),
		} );
		await waitFor( () =>
			expect( spy ).toHaveBeenCalledWith(
				'calypso_reader_atmosphere_thread_viewed',
				expect.objectContaining( { connection_id: 7, thread_target_uri: TARGET_URI } )
			)
		);

		const back = await screen.findByRole( 'button', { name: /back/i } );
		await user.click( back );
		expect( spy ).toHaveBeenCalledWith(
			'calypso_reader_atmosphere_thread_back_to_timeline_clicked',
			expect.objectContaining( { connection_id: 7, thread_target_uri: TARGET_URI } )
		);
	} );
} );

describe( 'ThreadPanel — slice 6 author chip + repost preface rewrites', () => {
	const reposterDid = 'did:plc:rep234567defghi234567jklab';
	const reposterHandle = 'joe.bsky.social';

	function fixtureWithRepost(): AtmosphereThreadResponse {
		const base = fixture();
		const post = ( base.thread as unknown as { post: Record< string, unknown > } ).post;
		post.reason = {
			type: 'repost',
			by: {
				did: reposterDid,
				handle: reposterHandle,
				display_name: 'Joe',
				avatar: null,
			},
			indexed_at: '2026-04-28T11:00:00Z',
		};
		return base;
	}

	beforeEach( () => {
		jest
			.spyOn( analytics, 'recordReaderTracksEvent' )
			.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );
	} );

	afterEach( () => {
		nock.cleanAll();
		jest.restoreAllMocks();
	} );

	it( 'author chip <a> href is the in-app profile URL (same-tab, no target/rel)', async () => {
		nock( BASE ).get( PATH ).query( { uri: TARGET_URI } ).reply( 200, fixtureWithRepost() );

		renderWithProvider( <ThreadPanel connection={ connection } did={ DID } rkey={ RKEY } />, {
			queryClient: makeQueryClient(),
		} );

		await screen.findAllByRole( 'link' );
		const authorLink = screen
			.getAllByRole( 'link' )
			.find(
				( a ) => a.getAttribute( 'href' ) === '/reader/atmosphere/7/profile/jane.bsky.social'
			);
		expect( authorLink ).toBeDefined();
		expect( authorLink ).not.toHaveAttribute( 'target' );
		expect( authorLink ).not.toHaveAttribute( 'rel' );
	} );

	it( 'repost preface name is a real <a> to the reposter in-app profile URL', async () => {
		nock( BASE ).get( PATH ).query( { uri: TARGET_URI } ).reply( 200, fixtureWithRepost() );

		renderWithProvider( <ThreadPanel connection={ connection } did={ DID } rkey={ RKEY } />, {
			queryClient: makeQueryClient(),
		} );

		const repostLink = await screen.findByRole( 'link', { name: /Joe/i } );
		expect( repostLink ).toHaveAttribute(
			'href',
			`/reader/atmosphere/7/profile/${ reposterHandle }`
		);
		expect( repostLink ).not.toHaveAttribute( 'target' );
		expect( repostLink ).not.toHaveAttribute( 'rel' );
	} );

	it( 'fires author_clicked with destination=in_app after the rewrite', async () => {
		const spy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
		nock( BASE ).get( PATH ).query( { uri: TARGET_URI } ).reply( 200, fixtureWithRepost() );

		const user = userEvent.setup();
		renderWithProvider( <ThreadPanel connection={ connection } did={ DID } rkey={ RKEY } />, {
			queryClient: makeQueryClient(),
		} );

		await screen.findAllByRole( 'link' );
		const authorLink = screen
			.getAllByRole( 'link' )
			.find(
				( a ) => a.getAttribute( 'href' ) === '/reader/atmosphere/7/profile/jane.bsky.social'
			);
		await user.click( authorLink as HTMLElement );
		expect( spy ).toHaveBeenCalledWith(
			'calypso_reader_atmosphere_thread_author_clicked',
			expect.objectContaining( {
				connection_id: 7,
				author_handle: 'jane.bsky.social',
				destination: 'in_app',
			} )
		);
	} );

	it( 'fires repost_author_clicked with destination=in_app when the reposter link is clicked', async () => {
		const spy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
		nock( BASE ).get( PATH ).query( { uri: TARGET_URI } ).reply( 200, fixtureWithRepost() );

		const user = userEvent.setup();
		renderWithProvider( <ThreadPanel connection={ connection } did={ DID } rkey={ RKEY } />, {
			queryClient: makeQueryClient(),
		} );

		const repostLink = await screen.findByRole( 'link', { name: /Joe/i } );
		await user.click( repostLink );
		expect( spy ).toHaveBeenCalledWith(
			'calypso_reader_atmosphere_thread_repost_author_clicked',
			expect.objectContaining( {
				connection_id: 7,
				post_uri: TARGET_URI,
				reposter_did: reposterDid,
				reposter_handle: reposterHandle,
				destination: 'in_app',
			} )
		);
	} );
} );

describe( 'ThreadPanel — quote composer integration', () => {
	beforeEach( () => {
		jest
			.spyOn( analytics, 'recordReaderTracksEvent' )
			.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );
	} );

	afterEach( () => {
		nock.cleanAll();
		jest.restoreAllMocks();
	} );

	it( "opens the composer in quote mode when the quotes count is clicked on the user's own post in the thread", async () => {
		const queryClient = makeQueryClient();
		queryClient.setQueryData( readerAtmosphereKeys.scopedThread( connection.id, TARGET_URI ), {
			thread: {
				type: 'post',
				post: {
					uri: TARGET_URI,
					cid: 'pcid',
					author: {
						did: connection.did,
						handle: connection.handle,
						display_name: connection.display_name,
						avatar: null,
					},
					created_at: '2026-04-28T10:00:00Z',
					indexed_at: '2026-04-28T10:00:00Z',
					text: 'my own post',
					html: '<p>my own post</p>',
					lang: [ 'en' ],
					reply_parent: null,
					reply_root: null,
					reason: null,
					embed: null,
					counts: { replies: 0, reposts: 0, likes: 0, quotes: 3 },
					bluesky_url: 'https://bsky.app/profile/viewer.bsky.social/post/3kabcdefghijk',
				},
				parent: null,
				replies: [],
			},
		} );

		const user = userEvent.setup();
		renderWithProvider(
			<ComposerProvider connectionId={ connection.id }>
				<ThreadPanel connection={ connection } did={ DID } rkey={ RKEY } />
				<ComposerModal />
			</ComposerProvider>,
			{ queryClient }
		);

		await user.click( await screen.findByRole( 'button', { name: /quote, 3 quotes/i } ) );
		expect( await screen.findByRole( 'dialog', { name: /quote post/i } ) ).toBeVisible();
	} );
} );
