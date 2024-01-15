/**
 * @jest-environment jsdom
 */

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { getCurrentRoutePattern } from '../../../state/selectors/get-current-route-pattern';
import CommandPalette from '../index';
import { useCommandPalette } from '../use-command-palette';

const INITIAL_STATE = {
	sites: {
		items: {},
	},
	currentUser: {
		capabilities: {
			[ 1 ]: {
				manage_options: true,
			},
		},
	},
	ui: {
		selectedSiteId: 1,
	},
};

const commands = [
	{
		name: 'getHelp',
		label: 'Get help',
	},
	{
		name: 'clearCache',
		label: 'Clear cache',
	},
	{
		name: 'enableEdgeCache',
		label: 'Enable edge cache',
	},
];
const mockStore = configureStore();
const store = mockStore( INITIAL_STATE );

jest.mock( '../../../state/selectors/get-current-route-pattern' );
jest.mock( '../use-command-palette' );

describe( 'CommandPalette', () => {
	it( 'should confirm that the command palette opens with the commands from the commands array', () => {
		( getCurrentRoutePattern as jest.Mock ).mockReturnValue( '/sites' );

		// Override the useCommandPalette mock values for this test case
		( useCommandPalette as jest.Mock ).mockReturnValue( {
			commands: commands,
			filterNotice: 'Mock Filter Notice',
			emptyListNotice: 'Mock Empty List Notice',
		} );

		// Trigger the command palette opening
		act( () => {
			fireEvent.keyDown( document, { key: 'k', metaKey: true } );
		} );
		render(
			<Provider store={ store }>
				<CommandPalette />
			</Provider>
		);

		waitFor( () => {
			expect( screen.getByPlaceholderText( 'Search for commands' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Get help' ) ).toBeInTheDocument();
		} );
	} );
} );
