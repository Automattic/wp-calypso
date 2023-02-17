/**
 * @jest-environment jsdom
 */
import { screen, render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClientProvider } from 'react-query';
import { Provider as ReduxProvider } from 'react-redux';
import wpcom from 'calypso/lib/wp';
import { createReduxStore } from 'calypso/state';
import { createQueryClient } from 'calypso/state/query-client';
import initialReducer from 'calypso/state/reducer';
import { DisconnectGitHubExpander } from '../disconnect-github-expander';

jest.mock( 'calypso/lib/wp' );

function renderWithProviders( connection ) {
	return render(
		<QueryClientProvider client={ createQueryClient() }>
			<ReduxProvider store={ createReduxStore( undefined, initialReducer ) }>
				<DisconnectGitHubExpander connection={ connection } />
			</ReduxProvider>
		</QueryClientProvider>
	);
}

test( 'disconnect button is disabled during request', async () => {
	renderWithProviders( { ID: 1, label: '' } );

	const disconnectButton = screen.getByRole( 'button', { name: '(disconnect)' } );

	expect( disconnectButton ).not.toBeDisabled();

	fireEvent.click( disconnectButton );

	await waitFor( () => expect( disconnectButton ).toBeDisabled() );

	( wpcom.req.get as jest.Mock ).mockReturnValue(
		Promise.resolve( { ID: 28807201, deleted: true } )
	);

	fireEvent.click( disconnectButton );
	await waitFor( () => expect( disconnectButton ).toBeDisabled() );

	expect( wpcom.req.get ).toHaveBeenCalledWith(
		expect.objectContaining( {
			path: expect.stringMatching( '/1' ),
			method: 'DELETE',
		} )
	);

	await waitFor( () => expect( disconnectButton ).not.toBeDisabled() );
} );

test( 'disconnect button is re-enabled after error', async () => {
	renderWithProviders( { ID: 1, label: '' } );

	const disconnectButton = screen.getByRole( 'button', { name: '(disconnect)' } );

	fireEvent.click( disconnectButton );

	expect( disconnectButton ).not.toBeDisabled();

	( wpcom.req.get as jest.Mock ).mockReturnValue( Promise.reject( { statusCode: 500 } ) );

	fireEvent.click( disconnectButton );
	await waitFor( () => expect( disconnectButton ).toBeDisabled() );

	expect( wpcom.req.get ).toHaveBeenCalledWith(
		expect.objectContaining( {
			path: expect.stringMatching( '/1' ),
			method: 'DELETE',
		} )
	);

	await waitFor( () => expect( disconnectButton ).not.toBeDisabled() );
} );
