/**
 * @jest-environment jsdom
 */
import { mastodonAuthStatusQueryOptions } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import * as noticeActions from 'calypso/state/notices/actions';
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

function storeState(
	state: string,
	instance: string,
	extras?: { returnPath?: string; reconnectingConnectionId?: number }
) {
	window.sessionStorage.setItem(
		'reader.mastodon.oauthState',
		JSON.stringify( { state, instance, ...extras } )
	);
}

function mockCompleteSuccess(
	connection: {
		id: number;
		handle: string;
		instance: string;
		display_name: string | null;
		avatar: string | null;
	} = {
		id: 99,
		handle: '@alice@mastodon.social',
		instance: 'mastodon.social',
		display_name: 'Alice',
		avatar: null,
	}
) {
	return nock( BASE )
		.post( COMPLETE_PATH, { step: 'complete', state: 'abc', code: 'xyz' } )
		.reply( 200, { connection } );
}

describe( 'MastodonOauthCallbackView', () => {
	beforeEach( () => {
		( page as unknown as jest.Mock ).mockClear();
		( page.replace as jest.Mock ).mockClear();
		mockRecordReaderTracksEvent.mockClear();
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
		expect( screen.getByRole( 'alert' ) ).toHaveTextContent( /canceled or denied/i );
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

	describe( 'reconnect path', () => {
		it( 'fires a success notice, primes auth-status, emits the completion event, and honors returnPath', async () => {
			storeState( 'abc', 'mastodon.social', {
				returnPath: '/reader/mastodon/99/timeline?tab=posts',
				reconnectingConnectionId: 99,
			} );
			mockCompleteSuccess();

			const successSpy = jest.spyOn( noticeActions, 'successNotice' );
			const client = makeClient();
			renderWithProvider( <MastodonOauthCallbackView query={ { state: 'abc', code: 'xyz' } } />, {
				queryClient: client,
			} );

			await waitFor( () =>
				expect( page.replace ).toHaveBeenCalledWith( '/reader/mastodon/99/timeline?tab=posts' )
			);
			expect( successSpy ).toHaveBeenCalled();
			expect( String( successSpy.mock.calls[ 0 ][ 0 ] ) ).toMatch(
				/@alice@mastodon\.social reconnected/
			);
			expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
				'calypso_reader_reauth_completed',
				expect.objectContaining( { provider: 'mastodon', connection_id: 99 } )
			);
			expect( client.getQueryData( mastodonAuthStatusQueryOptions( 99 ).queryKey ) ).toEqual( {
				needs_reauth: false,
			} );

			successSpy.mockRestore();
		} );

		it( 'falls back to the timeline route when returnPath is missing', async () => {
			storeState( 'abc', 'mastodon.social', { reconnectingConnectionId: 99 } );
			mockCompleteSuccess();

			renderWithProvider( <MastodonOauthCallbackView query={ { state: 'abc', code: 'xyz' } } />, {
				queryClient: makeClient(),
			} );

			await waitFor( () =>
				expect( page.replace ).toHaveBeenCalledWith( '/reader/mastodon/99/timeline' )
			);
		} );

		it( 'does not fire reauth_completed when reconnectingConnectionId is absent (fresh connect)', async () => {
			storeState( 'abc', 'mastodon.social' );
			mockCompleteSuccess();

			const successSpy = jest.spyOn( noticeActions, 'successNotice' );
			renderWithProvider( <MastodonOauthCallbackView query={ { state: 'abc', code: 'xyz' } } />, {
				queryClient: makeClient(),
			} );

			await waitFor( () => expect( page.replace ).toHaveBeenCalled() );
			expect( successSpy ).not.toHaveBeenCalled();
			expect( mockRecordReaderTracksEvent ).not.toHaveBeenCalledWith(
				'calypso_reader_reauth_completed',
				expect.anything()
			);

			successSpy.mockRestore();
		} );

		it( 'does not fire reauth_completed when reconnectingConnectionId mismatches the returned connection id', async () => {
			storeState( 'abc', 'mastodon.social', {
				returnPath: '/reader/mastodon/77/timeline',
				reconnectingConnectionId: 77,
			} );
			// Backend returned id 99 (e.g. user authorized a different account during
			// the reauth handoff).
			mockCompleteSuccess();

			const successSpy = jest.spyOn( noticeActions, 'successNotice' );
			renderWithProvider( <MastodonOauthCallbackView query={ { state: 'abc', code: 'xyz' } } />, {
				queryClient: makeClient(),
			} );

			// Falls back to the fresh-connect path: route to the *returned* id's timeline.
			await waitFor( () =>
				expect( page.replace ).toHaveBeenCalledWith( '/reader/mastodon/99/timeline' )
			);
			expect( successSpy ).not.toHaveBeenCalled();
			expect( mockRecordReaderTracksEvent ).not.toHaveBeenCalledWith(
				'calypso_reader_reauth_completed',
				expect.anything()
			);

			successSpy.mockRestore();
		} );
	} );
} );
