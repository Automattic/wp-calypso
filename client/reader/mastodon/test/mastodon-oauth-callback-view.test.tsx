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

function makeClient() {
	return new QueryClient( { defaultOptions: { queries: { retry: false } } } );
}

function storeState( state: string, instance: string ) {
	window.sessionStorage.setItem(
		'reader.mastodon.oauthState',
		JSON.stringify( { state, instance } )
	);
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
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/reader/mastodon/connections', {
				step: 'complete',
				state: 'abc',
				code: 'xyz',
			} )
			.reply( 200, {
				connection: {
					id: 99,
					handle: '@alice@mastodon.social',
					instance: 'mastodon.social',
					display_name: 'Alice',
					avatar: null,
				},
			} );

		renderWithProvider( <MastodonOauthCallbackView query={ { state: 'abc', code: 'xyz' } } />, {
			queryClient: makeClient(),
		} );

		await waitFor( () =>
			expect( page.replace ).toHaveBeenCalledWith( '/reader/mastodon/99/timeline' )
		);
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
