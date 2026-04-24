/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
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

jest.mock( '@automattic/calypso-router', () => {
	const replace = jest.fn();
	const fn = jest.fn() as jest.Mock & { replace: jest.Mock };
	fn.replace = replace;
	return { __esModule: true, default: fn };
} );

describe( 'MastodonConnectView', () => {
	beforeEach( () => ( page as unknown as jest.Mock ).mockClear() );
	afterEach( () => nock.cleanAll() );

	it( 'submits the connect form and navigates to the new account timeline', async () => {
		const user = userEvent.setup();
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/reader/mastodon/connections' )
			.reply( 200, {
				connection: {
					id: 99,
					handle: 'alice',
					instance: 'mastodon.social',
					display_name: 'Alice',
					avatar: null,
				},
			} );

		renderWithProvider( <MastodonConnectView /> );
		await user.type( screen.getByLabelText( /Instance/ ), 'mastodon.social' );
		await user.type( screen.getByLabelText( /Handle/ ), 'alice' );
		await user.type( screen.getByLabelText( /Access token/ ), 'abc123' );
		await user.click( screen.getByRole( 'button', { name: /Connect/ } ) );

		await waitFor( () => expect( page ).toHaveBeenCalledWith( '/reader/mastodon/99/timeline' ) );
	} );
} );
