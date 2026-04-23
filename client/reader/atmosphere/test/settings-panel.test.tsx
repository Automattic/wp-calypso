/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SettingsPanel } from '../settings-panel';

const BASE = 'https://public-api.wordpress.com';

function makeClient() {
	return new QueryClient( {
		defaultOptions: { queries: { retry: false, staleTime: 0 } },
	} );
}

describe( 'SettingsPanel', () => {
	afterEach( () => nock.cleanAll() );

	it( 'posts the entered handle and app password to the connections endpoint', async () => {
		let capturedBody: unknown = null;
		const scope = nock( BASE )
			.post( '/wpcom/v2/reader/atmosphere/connections', ( body ) => {
				capturedBody = body;
				return true;
			} )
			.reply( 200, {
				connection: { id: 101, handle: 'alice.bsky.social', did: 'did:plc:a', avatar: null },
			} );

		renderWithProvider( <SettingsPanel />, { queryClient: makeClient() } );

		const user = userEvent.setup();
		await user.type( screen.getByLabelText( /handle/i ), 'alice.bsky.social' );
		await user.type( screen.getByLabelText( /app password/i ), 'xxxx-xxxx-xxxx-xxxx' );
		await user.click( screen.getByRole( 'button', { name: /connect/i } ) );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		expect( capturedBody ).toEqual( {
			handle: 'alice.bsky.social',
			app_password: 'xxxx-xxxx-xxxx-xxxx',
		} );
	} );
} );
