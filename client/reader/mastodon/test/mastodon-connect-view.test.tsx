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
} );
