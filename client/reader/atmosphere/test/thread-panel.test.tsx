/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import * as analytics from 'calypso/state/reader/analytics/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
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
const PATH = '/wpcom/v2/reader/atmosphere/thread';

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
	return new QueryClient( { defaultOptions: { queries: { retry: false } } } );
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

	it( 'renders upstream_unavailable with Retry, fires error_shown + retry_clicked, recovers', async () => {
		const spy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
		nock( BASE )
			.get( PATH )
			.query( { uri: TARGET_URI } )
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
				target_uri: TARGET_URI,
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
				target_uri: TARGET_URI,
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
				expect.objectContaining( { connection_id: 7, target_uri: TARGET_URI } )
			)
		);

		const back = await screen.findByRole( 'button', { name: /back/i } );
		await user.click( back );
		expect( spy ).toHaveBeenCalledWith(
			'calypso_reader_atmosphere_thread_back_to_timeline_clicked',
			expect.objectContaining( { connection_id: 7, target_uri: TARGET_URI } )
		);
	} );
} );
