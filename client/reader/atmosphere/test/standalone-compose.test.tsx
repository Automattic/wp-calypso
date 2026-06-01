/**
 * @jest-environment jsdom
 *
 * End-to-end integration smoke tests for the standalone-compose stack.
 *
 * These exercise the full submit-to-success / submit-to-error cycle across
 * `<AtmosphereAccountView>` → `<TimelinePanel>` → `<ComposeFab>` /
 * `<TimelineComposePill>` → `<ComposerProvider>` → `<ComposerModal>` →
 * `createPostMutation`. Per-component contracts (FAB hide-while-modal-open,
 * pill entry_point dispatch, modal error mapping) are covered by their own
 * unit tests; this file fills the gap by asserting that the user-visible
 * pieces hang together.
 *
 * Scope reduction (see plan Task 17): cases 4 (FAB on Thread view),
 * 5 (FAB on Author-profile view), and 8 (connection-stickiness) are
 * intentionally skipped — those views all wrap the same `<ComposerProvider>`
 * and the FAB / stickiness behaviors are already proven by
 * `compose-fab.test.tsx` and `timeline-panel.test.tsx`. Cases 2/3 (pill
 * timeline / pill profile open) are covered indirectly by the existing
 * panel tests; the pill happy-path here adds full submit coverage.
 */
import page from '@automattic/calypso-router';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import * as noticeActions from 'calypso/state/notices/actions';
import * as analytics from 'calypso/state/reader/analytics/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { AtmosphereAccountView } from '../atmosphere-account-view';
import { TIMELINE_TAB } from '../helper';
import type React from 'react';

// `<ReaderMain>` pulls in a Redux subtree the test store doesn't seed.
jest.mock(
	'calypso/reader/components/reader-main',
	() =>
		function ReaderMain( { children }: { children: React.ReactNode } ) {
			return <div>{ children }</div>;
		}
);

jest.mock( 'calypso/components/data/document-head', () => () => null );

// Calypso router: page() is invoked by the View button in the success
// notice. Keep it as a Jest mock so we can spy on / assert against it
// without performing real navigation.
jest.mock( '@automattic/calypso-router', () => {
	const replace = jest.fn();
	const fn = jest.fn() as jest.Mock & { replace: jest.Mock };
	fn.replace = replace;
	return { __esModule: true, default: fn };
} );

const BASE = 'https://public-api.wordpress.com';
const LIST = '/wpcom/v2/reader/atmosphere/connections';
const TIMELINE = '/wpcom/v2/reader/atmosphere/connections/7/timeline';
const POSTS = '/wpcom/v2/reader/atmosphere/connections/7/posts';

function makeQueryClient() {
	return new QueryClient( { defaultOptions: { queries: { retry: false } } } );
}

function mockConnections() {
	return nock( BASE )
		.get( LIST )
		.reply( 200, {
			connections: [
				{
					id: 7,
					did: 'did:plc:7',
					handle: 'a.bsky.social',
					display_name: 'Alice',
					avatar: null,
				},
			],
		} );
}

function mockTimelineEmpty() {
	return nock( BASE ).get( TIMELINE ).query( {} ).reply( 200, { items: [], cursor: null } );
}

describe( 'Standalone compose end-to-end', () => {
	// `<AtmosphereNavigation>` (NavTabs) calls IntersectionObserver on
	// mount; jsdom doesn't ship one.
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

	beforeEach( () => {
		// recordReaderTracksEvent is a thunk that reads state.reader.follows;
		// the test store doesn't provide that slice. Replace it with a no-op
		// action creator so dispatch() doesn't throw, while still letting
		// spies observe call-site arguments.
		jest
			.spyOn( analytics, 'recordReaderTracksEvent' )
			.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );
		jest.spyOn( noticeActions, 'successNotice' );
		( page as unknown as jest.Mock ).mockReset();
		( page.replace as jest.Mock ).mockReset();
	} );

	afterEach( () => {
		nock.cleanAll();
		jest.restoreAllMocks();
	} );

	it( 'FAB happy path: typed text optimistically appears, then the placeholder is swapped for the server-confirmed item, the modal closes, and a "View" success notice is dispatched', async () => {
		const successSpy = noticeActions.successNotice as unknown as jest.Mock;
		const pageMock = page as unknown as jest.Mock;

		mockConnections();
		mockTimelineEmpty();

		// DID must match the strict regex in `route.ts` (24-char base32 body)
		// for `getThreadUrl` to return a non-null URL — otherwise the success
		// notice ships without the View action.
		const realUri = 'at://did:plc:abcdefghijklmnopqrstuvwx/app.bsky.feed.post/abcdefghijklm';
		// Delay the response so we have a window in which the optimistic
		// placeholder is observable in the DOM before the swap.
		nock( BASE )
			.post( POSTS, ( body ) => {
				// Standalone post: only `text` — no `reply`, no `quote`.
				return (
					body && body.text === 'hello world' && ! ( 'reply' in body ) && ! ( 'quote' in body )
				);
			} )
			.delay( 100 )
			.reply( 200, { post: { uri: realUri, cid: 'newcid', rkey: 'abcdefghijklm' } } );

		const user = userEvent.setup();
		renderWithProvider( <AtmosphereAccountView connectionId={ 7 } tab={ TIMELINE_TAB } />, {
			queryClient: makeQueryClient(),
		} );

		// Click the FAB to open the standalone composer.
		const fab = await screen.findByRole( 'button', { name: 'Compose' } );
		await user.click( fab );

		expect(
			await screen.findByRole( 'dialog', { name: 'New post · @a.bsky.social' } )
		).toBeVisible();

		await user.type( screen.getByRole( 'textbox' ), 'hello world' );
		await user.click( screen.getByRole( 'button', { name: 'Post' } ) );

		// Optimistic phase — the placeholder feed item carrying the typed
		// text shows up in the timeline before the network resolves.
		await waitFor( () => {
			const matches = screen.getAllByText( 'hello world' );
			// One match is the textarea value (still in the open modal); a
			// second match means the timeline rendered the placeholder.
			expect( matches.length ).toBeGreaterThanOrEqual( 2 );
		} );

		// Resolution — modal closes once the request settles.
		await waitFor( () => expect( nock.isDone() ).toBe( true ) );
		await waitFor( () => expect( screen.queryByRole( 'dialog' ) ).toBeNull() );

		// Post-resolution — the placeholder has been swapped for the
		// server-confirmed item; its text is still visible in the timeline.
		expect( screen.getByText( 'hello world' ) ).toBeVisible();

		// Success notice with a "View" action that navigates to the new
		// thread URL.
		await waitFor( () => expect( successSpy ).toHaveBeenCalled() );
		const [ noticeText, options ] = successSpy.mock.calls[ 0 ];
		expect( noticeText ).toBe( 'Your post was published.' );
		expect( options ).toEqual(
			expect.objectContaining( {
				button: 'View',
				onClick: expect.any( Function ),
			} )
		);

		options.onClick();
		expect( pageMock ).toHaveBeenCalledWith(
			'/reader/atmosphere/7/thread/did:plc:abcdefghijklmnopqrstuvwx/abcdefghijklm'
		);
	} );

	it( 'pill happy path: opens the standalone composer with entry_point=timeline_inline, posts, and closes', async () => {
		const recordSpy = analytics.recordReaderTracksEvent as unknown as jest.Mock;

		mockConnections();
		mockTimelineEmpty();

		nock( BASE )
			.post( POSTS, ( body ) => body && body.text === 'pill post' )
			.reply( 200, {
				post: {
					uri: 'at://did:plc:7/app.bsky.feed.post/pillabcdefghi',
					cid: 'cid',
					rkey: 'pillabcdefghi',
				},
			} );

		const user = userEvent.setup();
		renderWithProvider( <AtmosphereAccountView connectionId={ 7 } tab={ TIMELINE_TAB } />, {
			queryClient: makeQueryClient(),
		} );

		// Wait for the pill to render. Its accessible label is the
		// translated "What's up?" placeholder (curly apostrophe).
		const pill = await screen.findByRole( 'button', { name: /what['’]s up/i } );
		await user.click( pill );

		expect(
			await screen.findByRole( 'dialog', { name: 'New post · @a.bsky.social' } )
		).toBeVisible();

		// _compose_opened fires with the pill's entry_point dimension.
		await waitFor( () =>
			expect( recordSpy ).toHaveBeenCalledWith(
				'calypso_reader_atmosphere_compose_opened',
				expect.objectContaining( {
					connection_id: 7,
					entry_point: 'timeline_inline',
				} )
			)
		);

		await user.type( screen.getByRole( 'textbox' ), 'pill post' );
		await user.click( screen.getByRole( 'button', { name: 'Post' } ) );

		await waitFor( () => expect( nock.isDone() ).toBe( true ) );
		await waitFor( () => expect( screen.queryByRole( 'dialog' ) ).toBeNull() );
	} );

	it( 'optimistic-then-error: 502 rolls back the placeholder, keeps the modal + draft, renders the inline error, and fires _compose_error_shown once', async () => {
		const recordSpy = analytics.recordReaderTracksEvent as unknown as jest.Mock;

		mockConnections();
		mockTimelineEmpty();

		nock( BASE )
			.post( POSTS )
			.delay( 50 )
			.reply( 502, { error: 'atmosphere_upstream_unavailable' } );

		const user = userEvent.setup();
		renderWithProvider( <AtmosphereAccountView connectionId={ 7 } tab={ TIMELINE_TAB } />, {
			queryClient: makeQueryClient(),
		} );

		await user.click( await screen.findByRole( 'button', { name: 'Compose' } ) );
		await user.type( screen.getByRole( 'textbox' ), 'will fail' );
		await user.click( screen.getByRole( 'button', { name: 'Post' } ) );

		// Inline error appears (and the modal stays open).
		expect( await screen.findByText( /taking longer than usual/i ) ).toBeVisible();
		expect( screen.getByRole( 'dialog' ) ).toBeVisible();
		expect( screen.getByRole( 'textbox' ) ).toHaveValue( 'will fail' );

		// Placeholder rolled back: the typed text only appears once (in
		// the textarea), not in the timeline.
		const placeholderMatches = screen.queryAllByText( 'will fail' );
		expect( placeholderMatches ).toHaveLength( 1 );

		// _compose_error_shown fires exactly once with the mapped kind.
		await waitFor( () =>
			expect( recordSpy ).toHaveBeenCalledWith(
				'calypso_reader_atmosphere_compose_error_shown',
				expect.objectContaining( {
					connection_id: 7,
					error_kind: 'upstream_unavailable',
				} )
			)
		);
		const composeErrorCalls = recordSpy.mock.calls.filter(
			( [ event ] ) => event === 'calypso_reader_atmosphere_compose_error_shown'
		);
		expect( composeErrorCalls ).toHaveLength( 1 );
	} );

	it( 'auth error 401: shows a connection-error message, preserves the draft, and keeps the modal open', async () => {
		mockConnections();
		mockTimelineEmpty();

		nock( BASE ).post( POSTS ).reply( 401, { error: 'atmosphere_auth_required' } );

		const user = userEvent.setup();
		renderWithProvider( <AtmosphereAccountView connectionId={ 7 } tab={ TIMELINE_TAB } />, {
			queryClient: makeQueryClient(),
		} );

		await user.click( await screen.findByRole( 'button', { name: 'Compose' } ) );
		await user.type( screen.getByRole( 'textbox' ), 'auth fail' );
		await user.click( screen.getByRole( 'button', { name: 'Post' } ) );

		// The error toast surfaces a connection-error message with no link.
		expect( await screen.findByText( /Bluesky connection/i ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: /reconnect/i } ) ).toBeNull();

		// Modal stays open with the typed draft preserved.
		expect( screen.getByRole( 'dialog' ) ).toBeVisible();
		expect( screen.getByRole( 'textbox' ) ).toHaveValue( 'auth fail' );
	} );
} );
