/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import * as noticeActions from 'calypso/state/notices/actions';
import * as readerAnalytics from 'calypso/state/reader/analytics/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { TIMELINE_TAB } from '../helper';
import { MastodonAccountView } from '../mastodon-account-view';
import type React from 'react';

jest.mock(
	'calypso/reader/components/reader-main',
	() =>
		function ReaderMain( { children }: { children: React.ReactNode } ) {
			return <div>{ children }</div>;
		}
);

jest.mock( 'calypso/components/data/document-head', () => () => null );

jest.mock( '../timeline-panel', () => ( {
	TimelinePanel: () => <div>Mastodon timeline placeholder</div>,
} ) );

jest.mock( '@automattic/calypso-router', () => {
	const replace = jest.fn();
	const fn = jest.fn() as jest.Mock & { replace: jest.Mock };
	fn.replace = replace;
	return { __esModule: true, default: fn };
} );

const BASE = 'https://public-api.wordpress.com';
const listUrl = '/wpcom/v2/reader/mastodon/connections';

function makeClient() {
	return new QueryClient( { defaultOptions: { queries: { retry: false } } } );
}

function mockConnections() {
	nock( BASE )
		.get( listUrl )
		.reply( 200, {
			connections: [
				{
					id: 42,
					handle: '@jeherve@a8c.social',
					instance: 'a8c.social',
					display_name: 'Jeremy',
					avatar: null,
				},
			],
		} );
}

function mockConnectionDetails() {
	nock( BASE )
		.get( `${ listUrl }/42` )
		.reply( 200, {
			handle: '@jeherve@a8c.social',
			instance: 'a8c.social',
			display_name: 'Jeremy',
			description: '',
			avatar: null,
			header: null,
			counts: { followers: 0, following: 0, posts: 0 },
			raw: {},
		} );
}

describe( 'MastodonAccountView reauth gate', () => {
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

	let trackSpy: jest.SpyInstance;
	beforeEach( () => {
		// recordReaderTracksEvent is a thunk that reads state.reader.follows;
		// the test store doesn't seed that slice. Replace with a no-op so
		// dispatch() doesn't throw.
		trackSpy = jest
			.spyOn( readerAnalytics, 'recordReaderTracksEvent' )
			.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );
	} );

	afterEach( () => {
		nock.cleanAll();
		jest.restoreAllMocks();
	} );

	it( 'renders the gate overlay when auth-status reports needs_reauth: true', async () => {
		mockConnections();
		mockConnectionDetails();
		nock( BASE ).get( `${ listUrl }/42/auth-status` ).reply( 200, { needs_reauth: true } );

		renderWithProvider( <MastodonAccountView connectionId={ 42 } tab={ TIMELINE_TAB } />, {
			queryClient: makeClient(),
		} );

		const heading = await screen.findByRole( 'heading', {
			name: /reconnect to update permissions/i,
		} );
		expect( heading ).toBeVisible();

		const link = await screen.findByRole( 'link', { name: /reconnect on a8c\.social/i } );
		expect( link ).toHaveAttribute(
			'href',
			expect.stringContaining( '/reader/mastodon/connections/42/reconnect' )
		);

		// Gated content must not render the timeline placeholder.
		expect( screen.queryByText( 'Mastodon timeline placeholder' ) ).not.toBeInTheDocument();
	} );

	it( 'renders the gated content when auth-status reports needs_reauth: false', async () => {
		mockConnections();
		mockConnectionDetails();
		nock( BASE ).get( `${ listUrl }/42/auth-status` ).reply( 200, { needs_reauth: false } );

		renderWithProvider( <MastodonAccountView connectionId={ 42 } tab={ TIMELINE_TAB } />, {
			queryClient: makeClient(),
		} );

		await waitFor( () =>
			expect( screen.getByText( 'Mastodon timeline placeholder' ) ).toBeVisible()
		);
		expect(
			screen.queryByRole( 'heading', { name: /reconnect to update permissions/i } )
		).not.toBeInTheDocument();
	} );

	it( 'fires a success notice and strips ?reconnected= when landing back from OAuth', async () => {
		mockConnections();
		mockConnectionDetails();
		nock( BASE ).get( `${ listUrl }/42/auth-status` ).reply( 200, { needs_reauth: false } );

		const successSpy = jest.spyOn( noticeActions, 'successNotice' );
		const originalReplaceState = window.history.replaceState.bind( window.history );
		const replaceStateSpy = jest
			.spyOn( window.history, 'replaceState' )
			.mockImplementation( originalReplaceState );

		// Simulate the OAuth return: ?reconnected={connectionId} on the URL.
		window.history.replaceState( null, '', '/reader/mastodon/42/timeline?reconnected=42' );

		renderWithProvider( <MastodonAccountView connectionId={ 42 } tab={ TIMELINE_TAB } />, {
			queryClient: makeClient(),
		} );

		// Wait for the timeline to render (gate confirmed not_reauth).
		await waitFor( () =>
			expect( screen.getByText( 'Mastodon timeline placeholder' ) ).toBeVisible()
		);

		// successNotice should have been dispatched with the handle.
		await waitFor( () => {
			expect( successSpy ).toHaveBeenCalled();
		} );
		const noticeText = successSpy.mock.calls[ 0 ][ 0 ];
		expect( String( noticeText ) ).toMatch( /@jeherve@a8c\.social reconnected/ );

		// The hook should have stripped `?reconnected=42` via history.replaceState.
		await waitFor( () => {
			const lastCall = replaceStateSpy.mock.calls.findLast(
				( args ) => typeof args[ 2 ] === 'string' && ! args[ 2 ].includes( 'reconnected' )
			);
			expect( lastCall ).toBeDefined();
			expect( lastCall?.[ 2 ] ).toBe( '/reader/mastodon/42/timeline' );
		} );

		successSpy.mockRestore();
		replaceStateSpy.mockRestore();
		// Reset URL for subsequent tests.
		originalReplaceState( null, '', '/' );
	} );

	it( 'fires calypso_reader_reauth_gate_shown when the gate appears', async () => {
		mockConnections();
		mockConnectionDetails();
		nock( BASE ).get( `${ listUrl }/42/auth-status` ).reply( 200, { needs_reauth: true } );

		renderWithProvider( <MastodonAccountView connectionId={ 42 } tab={ TIMELINE_TAB } />, {
			queryClient: makeClient(),
		} );

		await screen.findByRole( 'heading', { name: /reconnect to update permissions/i } );

		await waitFor( () => {
			expect( trackSpy ).toHaveBeenCalledWith(
				'calypso_reader_reauth_gate_shown',
				expect.objectContaining( {
					provider: 'mastodon',
					connection_id: 42,
					trigger: 'auth-status',
				} )
			);
		} );
	} );

	it( 'fires calypso_reader_reauth_button_clicked when the reconnect link is activated', async () => {
		const user = userEvent.setup();
		mockConnections();
		mockConnectionDetails();
		nock( BASE ).get( `${ listUrl }/42/auth-status` ).reply( 200, { needs_reauth: true } );

		renderWithProvider( <MastodonAccountView connectionId={ 42 } tab={ TIMELINE_TAB } />, {
			queryClient: makeClient(),
		} );

		const link = await screen.findByRole( 'link', { name: /reconnect on a8c\.social/i } );
		await user.click( link );

		expect( trackSpy ).toHaveBeenCalledWith(
			'calypso_reader_reauth_button_clicked',
			expect.objectContaining( { provider: 'mastodon', connection_id: 42 } )
		);
	} );

	it( 'fires calypso_reader_reauth_completed when ?reconnected matches the connection', async () => {
		mockConnections();
		mockConnectionDetails();
		nock( BASE ).get( `${ listUrl }/42/auth-status` ).reply( 200, { needs_reauth: false } );

		const originalReplaceState = window.history.replaceState.bind( window.history );
		window.history.replaceState( null, '', '/reader/mastodon/42/timeline?reconnected=42' );

		renderWithProvider( <MastodonAccountView connectionId={ 42 } tab={ TIMELINE_TAB } />, {
			queryClient: makeClient(),
		} );

		await waitFor( () =>
			expect( screen.getByText( 'Mastodon timeline placeholder' ) ).toBeVisible()
		);

		await waitFor( () => {
			expect( trackSpy ).toHaveBeenCalledWith(
				'calypso_reader_reauth_completed',
				expect.objectContaining( { provider: 'mastodon', connection_id: 42 } )
			);
		} );

		// Reset URL for subsequent tests.
		originalReplaceState( null, '', '/' );
	} );
} );
