/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { MastodonConnectView } from '../mastodon-connect-view';
import type React from 'react';

jest.mock(
	'calypso/reader/components/reader-main',
	() =>
		function ReaderMain( { children }: { children: React.ReactNode } ) {
			return <div>{ children }</div>;
		}
);

jest.mock( 'calypso/components/data/document-head', () => () => null );

const mockRecordReaderTracksEvent: jest.Mock = jest.fn( () => ( {
	type: 'TEST_TRACKS_EVENT',
} ) );

jest.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: ( ...args: unknown[] ) => mockRecordReaderTracksEvent( ...args ),
} ) );

describe( 'MastodonConnectView', () => {
	let assignMock: jest.Mock;
	let originalLocation: Location;

	beforeEach( () => {
		originalLocation = window.location;
		assignMock = jest.fn();
		Object.defineProperty( window, 'location', {
			configurable: true,
			writable: true,
			value: { ...originalLocation, assign: assignMock },
		} );
		window.sessionStorage.clear();
	} );

	afterEach( () => {
		nock.cleanAll();
		Object.defineProperty( window, 'location', {
			configurable: true,
			writable: true,
			value: originalLocation,
		} );
	} );

	it( 'submits the instance, saves state, and redirects to the authorize URL', async () => {
		const user = userEvent.setup();
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/reader/mastodon/connections', {
				step: 'authorize',
				instance: 'mastodon.social',
			} )
			.reply( 200, {
				authorize_url: 'https://mastodon.social/oauth/authorize?client_id=x&state=abc',
				state: 'abc',
			} );

		renderWithProvider( <MastodonConnectView /> );
		await user.type( screen.getByLabelText( /Instance/ ), 'mastodon.social' );
		await user.click( screen.getByRole( 'button', { name: /Continue/ } ) );

		await waitFor( () =>
			expect( assignMock ).toHaveBeenCalledWith(
				'https://mastodon.social/oauth/authorize?client_id=x&state=abc'
			)
		);
		const stored = JSON.parse(
			window.sessionStorage.getItem( 'reader.mastodon.oauthState' ) ?? ''
		);
		expect( stored ).toEqual( { state: 'abc', instance: 'mastodon.social' } );
	} );

	it( 'refuses to follow a non-https authorize_url and does not save state', async () => {
		const user = userEvent.setup();
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/reader/mastodon/connections', {
				step: 'authorize',
				instance: 'mastodon.social',
			} )
			.reply( 200, {
				authorize_url: 'javascript:alert(1)',
				state: 'abc',
			} );

		renderWithProvider( <MastodonConnectView /> );
		await user.type( screen.getByLabelText( /Instance/ ), 'mastodon.social' );
		await user.click( screen.getByRole( 'button', { name: /Continue/ } ) );

		await waitFor( () =>
			expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
				'calypso_reader_mastodon_authorize_error',
				expect.objectContaining( { reason: 'unsafe_url' } )
			)
		);
		expect( assignMock ).not.toHaveBeenCalled();
		expect( window.sessionStorage.getItem( 'reader.mastodon.oauthState' ) ).toBeNull();
	} );

	it( 'renders the connect title with the Mastodon icon, the unified subtitle, and the instance instructions above the input', () => {
		renderWithProvider( <MastodonConnectView /> );
		expect( screen.getByRole( 'heading', { name: /Connect a Mastodon account/i } ) ).toBeVisible();
		expect( screen.getByTestId( 'mastodon-section-logo' ) ).toBeVisible();
		expect( screen.getByText( /Bring your Mastodon account into the Reader\./i ) ).toBeVisible();
		const instruction = screen.getByText(
			/Enter your server.{1,3}s address.*we.{1,3}ll hand you off to sign in there\./i
		);
		expect( instruction ).toBeVisible();
		const input = screen.getByLabelText( /Instance/ );
		const form = instruction.closest( 'form' );
		expect( form ).not.toBeNull();
		// Both elements must live inside the same <form>, with the
		// instruction preceding the input in document order.
		expect( input.closest( 'form' ) ).toBe( form );
		expect(
			instruction.compareDocumentPosition( input ) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
	} );

	it( 'does not redirect when the authorize mutation errors', async () => {
		const user = userEvent.setup();
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/reader/mastodon/connections', {
				step: 'authorize',
				instance: 'nope.example',
			} )
			.reply( 400, { error: 'invalid_instance', message: 'bad host' } );

		renderWithProvider( <MastodonConnectView /> );
		await user.type( screen.getByLabelText( /Instance/ ), 'nope.example' );
		await user.click( screen.getByRole( 'button', { name: /Continue/ } ) );

		await waitFor( () =>
			expect( screen.getByText( /couldn't reach that mastodon instance/i ) ).toBeVisible()
		);
		expect( assignMock ).not.toHaveBeenCalled();
		expect( window.sessionStorage.getItem( 'reader.mastodon.oauthState' ) ).toBeNull();
	} );
} );
