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
import { MastodonAuthorProfileView } from '../author-profile-view';
import type React from 'react';

jest.mock( 'calypso/lib/logstash', () => ( { logToLogstash: jest.fn() } ) );

jest.mock(
	'calypso/reader/components/reader-main',
	() =>
		function ReaderMain( { children }: { children: React.ReactNode } ) {
			return <div>{ children }</div>;
		}
);

jest.mock( 'calypso/components/data/document-head', () => () => null );

jest.mock( '../author-profile-panel', () => ( {
	MastodonAuthorProfilePanel: () => <div>Mastodon author profile placeholder</div>,
} ) );

jest.mock( '@automattic/calypso-router', () => {
	const replace = jest.fn();
	const fn = jest.fn() as jest.Mock & { replace: jest.Mock };
	fn.replace = replace;
	return { __esModule: true, default: fn };
} );

const BASE = 'https://public-api.wordpress.com';
const listUrl = '/wpcom/v2/reader/mastodon/connections';
const ACTOR = 'alice@mastodon.social';

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

describe( 'MastodonAuthorProfileView reauth gate', () => {
	let assignMock: jest.Mock;
	let originalLocation: Location;
	let trackSpy: jest.SpyInstance;

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
		trackSpy = jest
			.spyOn( readerAnalytics, 'recordReaderTracksEvent' )
			.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );

		originalLocation = window.location;
		assignMock = jest.fn();
		Object.defineProperty( window, 'location', {
			configurable: true,
			writable: true,
			value: {
				...originalLocation,
				pathname: `/reader/mastodon/42/profile/${ ACTOR }`,
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
		nock( BASE ).get( `${ listUrl }/42/auth-status` ).reply( 200, { needs_reauth: true } );

		renderWithProvider( <MastodonAuthorProfileView connectionId={ 42 } actor={ ACTOR } />, {
			queryClient: makeClient(),
		} );

		const heading = await screen.findByRole( 'heading', {
			name: /reconnect to update permissions/i,
		} );
		expect( heading ).toBeVisible();
		expect( screen.getByRole( 'button', { name: /reconnect on a8c\.social/i } ) ).toBeVisible();

		// Gated content must not render the panel placeholder while the gate is up.
		expect( screen.queryByText( 'Mastodon author profile placeholder' ) ).not.toBeInTheDocument();
	} );

	it( 'renders the panel when auth-status reports needs_reauth: false', async () => {
		mockConnections();
		nock( BASE ).get( `${ listUrl }/42/auth-status` ).reply( 200, { needs_reauth: false } );

		renderWithProvider( <MastodonAuthorProfileView connectionId={ 42 } actor={ ACTOR } />, {
			queryClient: makeClient(),
		} );

		await waitFor( () =>
			expect( screen.getByText( 'Mastodon author profile placeholder' ) ).toBeVisible()
		);
		expect(
			screen.queryByRole( 'heading', { name: /reconnect to update permissions/i } )
		).not.toBeInTheDocument();
		// Composer FAB should remain visible on a healthy connection.
		expect( screen.getByRole( 'button', { name: /^compose$/i } ) ).toBeVisible();
	} );

	it( 'hides the compose FAB while the reauth gate is showing', async () => {
		mockConnections();
		nock( BASE ).get( `${ listUrl }/42/auth-status` ).reply( 200, { needs_reauth: true } );

		renderWithProvider( <MastodonAuthorProfileView connectionId={ 42 } actor={ ACTOR } />, {
			queryClient: makeClient(),
		} );

		await screen.findByRole( 'heading', { name: /reconnect to update permissions/i } );
		expect( screen.queryByRole( 'button', { name: /^compose$/i } ) ).not.toBeInTheDocument();
	} );

	it( 'fires calypso_reader_reauth_gate_shown when the gate appears', async () => {
		mockConnections();
		nock( BASE ).get( `${ listUrl }/42/auth-status` ).reply( 200, { needs_reauth: true } );

		renderWithProvider( <MastodonAuthorProfileView connectionId={ 42 } actor={ ACTOR } />, {
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

	it( 'kicks off the authorize mutation, stores oauth-state with the profile return path, and navigates on click', async () => {
		const user = userEvent.setup();
		mockConnections();
		nock( BASE ).get( `${ listUrl }/42/auth-status` ).reply( 200, { needs_reauth: true } );
		nock( BASE ).post( listUrl, { step: 'authorize', instance: 'a8c.social' } ).reply( 200, {
			authorize_url: 'https://a8c.social/oauth/authorize?client_id=x&state=abc',
			state: 'abc',
		} );

		renderWithProvider( <MastodonAuthorProfileView connectionId={ 42 } actor={ ACTOR } />, {
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
			returnPath: `/reader/mastodon/42/profile/${ ACTOR }`,
			reconnectingConnectionId: 42,
		} );
	} );

	it( 'surfaces an error notice when the authorize endpoint fails', async () => {
		const user = userEvent.setup();
		const errorSpy = jest.spyOn( noticeActions, 'errorNotice' );

		mockConnections();
		nock( BASE ).get( `${ listUrl }/42/auth-status` ).reply( 200, { needs_reauth: true } );
		nock( BASE )
			.post( listUrl, { step: 'authorize', instance: 'a8c.social' } )
			.reply( 429, { error: 'rate_limited', message: 'slow down' } );

		renderWithProvider( <MastodonAuthorProfileView connectionId={ 42 } actor={ ACTOR } />, {
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
} );
