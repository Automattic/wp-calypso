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
	let assignMock: jest.Mock;
	let originalLocation: Location;

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
		// recordReaderTracksEvent is a thunk that reads the follows query cache;
		// the test store doesn't seed that slice. Replace with a no-op so
		// dispatch() doesn't throw.
		trackSpy = jest
			.spyOn( readerAnalytics, 'recordReaderTracksEvent' )
			.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );

		// Stub window.location so the reconnect button's window.location.assign()
		// doesn't tear the JSDOM page down mid-test.
		originalLocation = window.location;
		assignMock = jest.fn();
		Object.defineProperty( window, 'location', {
			configurable: true,
			writable: true,
			value: {
				...originalLocation,
				pathname: '/reader/mastodon/42/timeline',
				search: '',
				assign: assignMock,
			},
		} );
		window.sessionStorage.clear();
	} );

	afterEach( () => {
		nock.cleanAll();
		jest.restoreAllMocks();
		Object.defineProperty( window, 'location', {
			configurable: true,
			writable: true,
			value: originalLocation,
		} );
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
		expect( screen.getByRole( 'button', { name: /reconnect on a8c\.social/i } ) ).toBeVisible();

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
		// Composer FAB should remain visible on a healthy connection.
		expect( screen.getByRole( 'button', { name: /^compose$/i } ) ).toBeVisible();
	} );

	it( 'hides the compose FAB while the reauth gate is showing', async () => {
		mockConnections();
		mockConnectionDetails();
		nock( BASE ).get( `${ listUrl }/42/auth-status` ).reply( 200, { needs_reauth: true } );

		renderWithProvider( <MastodonAccountView connectionId={ 42 } tab={ TIMELINE_TAB } />, {
			queryClient: makeClient(),
		} );

		// The gate has rendered.
		await screen.findByRole( 'heading', { name: /reconnect to update permissions/i } );
		// The compose FAB sits outside the gate but should also be hidden so a
		// user can't kick off a post that would fail with auth_required.
		expect( screen.queryByRole( 'button', { name: /^compose$/i } ) ).not.toBeInTheDocument();
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

	it( 'kicks off the authorize mutation, stores oauth-state with reconnect hints, and navigates to the authorize URL on click', async () => {
		const user = userEvent.setup();
		mockConnections();
		mockConnectionDetails();
		nock( BASE ).get( `${ listUrl }/42/auth-status` ).reply( 200, { needs_reauth: true } );
		nock( BASE ).post( listUrl, { step: 'authorize', instance: 'a8c.social' } ).reply( 200, {
			authorize_url: 'https://a8c.social/oauth/authorize?client_id=x&state=abc',
			state: 'abc',
		} );

		renderWithProvider( <MastodonAccountView connectionId={ 42 } tab={ TIMELINE_TAB } />, {
			queryClient: makeClient(),
		} );

		const button = await screen.findByRole( 'button', { name: /reconnect on a8c\.social/i } );
		await user.click( button );

		await waitFor( () =>
			expect( assignMock ).toHaveBeenCalledWith(
				'https://a8c.social/oauth/authorize?client_id=x&state=abc'
			)
		);
		expect( trackSpy ).toHaveBeenCalledWith(
			'calypso_reader_reauth_button_clicked',
			expect.objectContaining( { provider: 'mastodon', connection_id: 42 } )
		);

		const stored = JSON.parse(
			window.sessionStorage.getItem( 'reader.mastodon.oauthState' ) ?? ''
		);
		expect( stored ).toEqual( {
			state: 'abc',
			instance: 'a8c.social',
			returnPath: '/reader/mastodon/42/timeline',
			reconnectingConnectionId: 42,
		} );
	} );

	it( 'refuses to follow an authorize_url whose host does not match the connection instance', async () => {
		const user = userEvent.setup();
		const errorSpy = jest.spyOn( noticeActions, 'errorNotice' );

		mockConnections();
		mockConnectionDetails();
		nock( BASE ).get( `${ listUrl }/42/auth-status` ).reply( 200, { needs_reauth: true } );
		nock( BASE ).post( listUrl, { step: 'authorize', instance: 'a8c.social' } ).reply( 200, {
			authorize_url: 'https://evil.example/oauth/authorize?client_id=x&state=abc',
			state: 'abc',
		} );

		renderWithProvider( <MastodonAccountView connectionId={ 42 } tab={ TIMELINE_TAB } />, {
			queryClient: makeClient(),
		} );

		const button = await screen.findByRole( 'button', { name: /reconnect on a8c\.social/i } );
		await user.click( button );

		await waitFor( () => expect( errorSpy ).toHaveBeenCalled() );
		expect( assignMock ).not.toHaveBeenCalled();
		expect( window.sessionStorage.getItem( 'reader.mastodon.oauthState' ) ).toBeNull();
		expect( trackSpy ).toHaveBeenCalledWith(
			'calypso_reader_mastodon_authorize_error',
			expect.objectContaining( { reason: 'unsafe_url' } )
		);

		errorSpy.mockRestore();
	} );

	it( 'refuses to follow a non-https authorize_url, surfaces an error notice, and leaves storage empty', async () => {
		const user = userEvent.setup();
		const errorSpy = jest.spyOn( noticeActions, 'errorNotice' );

		mockConnections();
		mockConnectionDetails();
		nock( BASE ).get( `${ listUrl }/42/auth-status` ).reply( 200, { needs_reauth: true } );
		nock( BASE ).post( listUrl, { step: 'authorize', instance: 'a8c.social' } ).reply( 200, {
			authorize_url: 'http://a8c.social/oauth/authorize',
			state: 'abc',
		} );

		renderWithProvider( <MastodonAccountView connectionId={ 42 } tab={ TIMELINE_TAB } />, {
			queryClient: makeClient(),
		} );

		const button = await screen.findByRole( 'button', { name: /reconnect on a8c\.social/i } );
		await user.click( button );

		await waitFor( () => expect( errorSpy ).toHaveBeenCalled() );
		expect( assignMock ).not.toHaveBeenCalled();
		expect( window.sessionStorage.getItem( 'reader.mastodon.oauthState' ) ).toBeNull();
		expect( trackSpy ).toHaveBeenCalledWith(
			'calypso_reader_mastodon_authorize_error',
			expect.objectContaining( { reason: 'unsafe_url' } )
		);

		errorSpy.mockRestore();
	} );

	it( 'surfaces an error notice when the authorize endpoint fails', async () => {
		const user = userEvent.setup();
		const errorSpy = jest.spyOn( noticeActions, 'errorNotice' );

		mockConnections();
		mockConnectionDetails();
		nock( BASE ).get( `${ listUrl }/42/auth-status` ).reply( 200, { needs_reauth: true } );
		nock( BASE )
			.post( listUrl, { step: 'authorize', instance: 'a8c.social' } )
			.reply( 429, { error: 'rate_limited', message: 'slow down' } );

		renderWithProvider( <MastodonAccountView connectionId={ 42 } tab={ TIMELINE_TAB } />, {
			queryClient: makeClient(),
		} );

		const button = await screen.findByRole( 'button', { name: /reconnect on a8c\.social/i } );
		await user.click( button );

		await waitFor( () => expect( errorSpy ).toHaveBeenCalled() );
		expect( assignMock ).not.toHaveBeenCalled();
		expect( trackSpy ).toHaveBeenCalledWith(
			'calypso_reader_mastodon_authorize_error',
			expect.objectContaining( { reason: 'authorize_failed' } )
		);

		errorSpy.mockRestore();
	} );

	it( 'surfaces an error notice and refuses to redirect when sessionStorage cannot persist the oauth state', async () => {
		const user = userEvent.setup();
		const errorSpy = jest.spyOn( noticeActions, 'errorNotice' );
		const setItemSpy = jest.spyOn( Storage.prototype, 'setItem' ).mockImplementation( () => {
			throw new DOMException( 'QuotaExceeded' );
		} );

		mockConnections();
		mockConnectionDetails();
		nock( BASE ).get( `${ listUrl }/42/auth-status` ).reply( 200, { needs_reauth: true } );
		nock( BASE ).post( listUrl, { step: 'authorize', instance: 'a8c.social' } ).reply( 200, {
			authorize_url: 'https://a8c.social/oauth/authorize?client_id=x&state=abc',
			state: 'abc',
		} );

		renderWithProvider( <MastodonAccountView connectionId={ 42 } tab={ TIMELINE_TAB } />, {
			queryClient: makeClient(),
		} );

		const button = await screen.findByRole( 'button', { name: /reconnect on a8c\.social/i } );
		await user.click( button );

		await waitFor( () => expect( errorSpy ).toHaveBeenCalled() );
		expect( assignMock ).not.toHaveBeenCalled();
		expect( trackSpy ).toHaveBeenCalledWith(
			'calypso_reader_mastodon_authorize_error',
			expect.objectContaining( { reason: 'state_persist_failed' } )
		);

		setItemSpy.mockRestore();
		errorSpy.mockRestore();
	} );
} );
