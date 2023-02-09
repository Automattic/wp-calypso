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

test( 'toggles visibility of disconnect button', () => {
	renderWithProviders( { ID: 1, label: '' } );
	const toggleButton = screen.getByRole( 'button', { name: 'Disconnect from GitHub' } );

	expect( toggleButton ).toHaveAttribute( 'aria-expanded', 'false' );
	expect( screen.queryByRole( 'button', { name: 'Disconnect' } ) ).toBeNull();

	fireEvent.click( toggleButton );

	expect( toggleButton ).toHaveAttribute( 'aria-expanded', 'true' );
	expect( screen.getByRole( 'button', { name: 'Disconnect' } ) ).toBeVisible();

	fireEvent.click( toggleButton );

	expect( toggleButton ).toHaveAttribute( 'aria-expanded', 'false' );
	expect( screen.queryByRole( 'button', { name: 'Disconnect' } ) ).toBeNull();
} );

test( 'disconnect button is disabled during request', async () => {
	renderWithProviders( { ID: 1, label: '' } );

	fireEvent.click( screen.getByRole( 'button', { name: 'Disconnect from GitHub' } ) );
	const disconnectButton = screen.getByRole( 'button', { name: 'Disconnect' } );

	expect( disconnectButton ).not.toBeDisabled();

	let resolve;
	( wpcom.req.get as jest.Mock ).mockReturnValue( new Promise( ( r ) => ( resolve = r ) ) );

	fireEvent.click( disconnectButton );
	await waitFor( () => expect( disconnectButton ).toBeDisabled() );

	expect( wpcom.req.get ).toHaveBeenCalledWith(
		expect.objectContaining( {
			path: expect.stringMatching( '/1' ),
			method: 'DELETE',
		} )
	);

	resolve( { ID: 28807201, deleted: true } );

	await waitFor( () => expect( disconnectButton ).not.toBeDisabled() );
} );

test( 'disconnect button is re-enabled after error', async () => {
	renderWithProviders( { ID: 1, label: '' } );

	fireEvent.click( screen.getByRole( 'button', { name: 'Disconnect from GitHub' } ) );
	const disconnectButton = screen.getByRole( 'button', { name: 'Disconnect' } );

	expect( disconnectButton ).not.toBeDisabled();

	let reject;
	( wpcom.req.get as jest.Mock ).mockReturnValue( new Promise( ( _, r ) => ( reject = r ) ) );

	fireEvent.click( disconnectButton );
	await waitFor( () => expect( disconnectButton ).toBeDisabled() );

	expect( wpcom.req.get ).toHaveBeenCalledWith(
		expect.objectContaining( {
			path: expect.stringMatching( '/1' ),
			method: 'DELETE',
		} )
	);

	reject( { statusCode: 500 } );

	await waitFor( () => expect( disconnectButton ).not.toBeDisabled() );
} );
