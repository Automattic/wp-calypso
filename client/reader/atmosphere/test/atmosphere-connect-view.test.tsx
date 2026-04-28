/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { AtmosphereConnectView } from '../atmosphere-connect-view';
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

describe( 'AtmosphereConnectView', () => {
	beforeEach( () => ( page as unknown as jest.Mock ).mockClear() );
	afterEach( () => nock.cleanAll() );

	it( 'submits the connect form and navigates to the new account timeline', async () => {
		const user = userEvent.setup();
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/reader/atmosphere/connections' )
			.reply( 200, {
				connection: {
					id: 99,
					did: 'did:plc:99',
					handle: 'alice.bsky.social',
					display_name: 'Alice',
					avatar: null,
				},
			} );

		renderWithProvider( <AtmosphereConnectView /> );
		await user.type( screen.getByLabelText( /Handle/ ), 'alice.bsky.social' );
		await user.type( screen.getByLabelText( /App password/ ), 'pass-word-xxx-xxx' );
		await user.click( screen.getByRole( 'button', { name: /Connect/ } ) );

		await waitFor( () => expect( page ).toHaveBeenCalledWith( '/reader/atmosphere/99/timeline' ) );
	} );
} );
