/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { MastodonOauthCallbackView } from '../mastodon-oauth-callback-view';
import type React from 'react';

jest.mock(
	'calypso/reader/components/reader-main',
	() =>
		function ReaderMain( { children }: { children: React.ReactNode } ) {
			return <div>{ children }</div>;
		}
);

jest.mock( 'calypso/components/data/document-head', () => () => null );

jest.mock( '@automattic/calypso-router', () => {
	const replace = jest.fn();
	const fn = jest.fn() as jest.Mock & { replace: jest.Mock };
	fn.replace = replace;
	return { __esModule: true, default: fn };
} );

const mockRecordReaderTracksEvent: jest.Mock = jest.fn( () => ( {
	type: 'TEST_TRACKS_EVENT',
} ) );

jest.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: ( ...args: unknown[] ) => mockRecordReaderTracksEvent( ...args ),
} ) );

const BASE = 'https://public-api.wordpress.com';
const COMPLETE_PATH = '/wpcom/v2/reader/mastodon/connections';

function makeClient() {
	return new QueryClient( { defaultOptions: { queries: { retry: false } } } );
}

function storeState( state: string, instance: string ) {
	window.sessionStorage.setItem(
		'reader.mastodon.oauthState',
		JSON.stringify( { state, instance } )
	);
}

function mockCompleteSuccess() {
	return nock( BASE )
		.post( COMPLETE_PATH, { step: 'complete', state: 'abc', code: 'xyz' } )
		.reply( 200, {
			connection: {
				id: 99,
				handle: '@alice@mastodon.social',
				instance: 'mastodon.social',
				display_name: 'Alice',
				avatar: null,
			},
		} );
}

describe( 'MastodonOauthCallbackView', () => {
	beforeEach( () => {
		( page as unknown as jest.Mock ).mockClear();
		( page.replace as jest.Mock ).mockClear();
		window.sessionStorage.clear();
	} );
	afterEach( () => nock.cleanAll() );

	it( 'calls step=complete and redirects to the new connection timeline on success', async () => {
		storeState( 'abc', 'mastodon.social' );
		mockCompleteSuccess();

		renderWithProvider( <MastodonOauthCallbackView query={ { state: 'abc', code: 'xyz' } } />, {
			queryClient: makeClient(),
		} );

		await waitFor( () =>
			expect( page.replace ).toHaveBeenCalledWith( '/reader/mastodon/99/timeline' )
		);
		expect( window.sessionStorage.getItem( 'reader.mastodon.oauthState' ) ).toBeNull();
	} );

	it( 'does not flash a state-mismatch error after onSuccess clears storage', async () => {
		storeState( 'abc', 'mastodon.social' );
		mockCompleteSuccess();

		renderWithProvider( <MastodonOauthCallbackView query={ { state: 'abc', code: 'xyz' } } />, {
			queryClient: makeClient(),
		} );

		await waitFor( () => expect( page.replace ).toHaveBeenCalled() );
		// After complete.isSuccess the view should not render the alert: the
		// stored state was just cleared, but the view should suppress the
		// transient mismatch while navigating away.
		expect( screen.queryByRole( 'alert' ) ).not.toBeInTheDocument();
	} );

	it( 'fires step=complete only once — a second interceptor stays pending', async () => {
		storeState( 'abc', 'mastodon.social' );
		// Two interceptors with distinct responses. If the effect re-ran
		// for any reason (dependency-change re-run, StrictMode double-invoke
		// in dev, etc.) and the ref guard failed, the second request would
		// match the 500 interceptor. The guard working means only the first
		// interceptor fires and the second stays pending.
		mockCompleteSuccess();
		const secondInterceptor = nock( BASE )
			.post( COMPLETE_PATH, { step: 'complete', state: 'abc', code: 'xyz' } )
			.reply( 500, { error: 'should_not_have_been_called' } );

		renderWithProvider( <MastodonOauthCallbackView query={ { state: 'abc', code: 'xyz' } } />, {
			queryClient: makeClient(),
		} );

		await waitFor( () => expect( page.replace ).toHaveBeenCalled() );
		expect( secondInterceptor.isDone() ).toBe( false );
	} );

	it( 'clears stored state and shows a server-side error when complete fails', async () => {
		storeState( 'abc', 'mastodon.social' );
		nock( BASE )
			.post( COMPLETE_PATH, { step: 'complete', state: 'abc', code: 'xyz' } )
			.reply( 429, { error: 'rate_limited', message: 'slow down' } );

		renderWithProvider( <MastodonOauthCallbackView query={ { state: 'abc', code: 'xyz' } } />, {
			queryClient: makeClient(),
		} );

		await waitFor( () => expect( screen.getByRole( 'alert' ) ).toHaveTextContent( /slow down/i ) );
		expect( page.replace ).not.toHaveBeenCalled();
		expect( window.sessionStorage.getItem( 'reader.mastodon.oauthState' ) ).toBeNull();
	} );

	it( 'shows the provider error when the provider redirected back with ?error', () => {
		renderWithProvider( <MastodonOauthCallbackView query={ { error: 'access_denied' } } />, {
			queryClient: makeClient(),
		} );
		expect( screen.getByRole( 'alert' ) ).toHaveTextContent( /cancelled or denied/i );
		expect( page.replace ).not.toHaveBeenCalled();
	} );

	it( 'shows an error when the state does not match the stored value', () => {
		storeState( 'abc', 'mastodon.social' );
		renderWithProvider(
			<MastodonOauthCallbackView query={ { state: 'different', code: 'xyz' } } />,
			{ queryClient: makeClient() }
		);
		expect( screen.getByRole( 'alert' ) ).toHaveTextContent( /authorization link has expired/i );
	} );

	it( 'shows an error when required parameters are missing', () => {
		renderWithProvider( <MastodonOauthCallbackView query={ {} } />, {
			queryClient: makeClient(),
		} );
		expect( screen.getByRole( 'alert' ) ).toHaveTextContent( /missing required information/i );
	} );

	it( 'navigates back to the connect page from the error state', async () => {
		const user = userEvent.setup();
		renderWithProvider( <MastodonOauthCallbackView query={ { error: 'access_denied' } } />, {
			queryClient: makeClient(),
		} );
		await user.click( screen.getByRole( 'button', { name: /back to connect/i } ) );
		expect( page ).toHaveBeenCalledWith( '/reader/mastodon/connect' );
	} );
} );
