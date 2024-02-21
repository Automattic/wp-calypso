/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { isCommandPaletteOpen } from '../../../state/command-palette/selectors';
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
		callback: ( { close }: { close: () => void } ) => {
			close();
		},
	},
	{
		name: 'sendFeedback',
		label: 'Send feedback',
		searchLabel: 'find help',
		callback: ( { close }: { close: () => void } ) => {
			close();
		},
	},
	{
		name: 'clearCache',
		label: 'Clear cache',
		callback: ( { close }: { close: () => void } ) => {
			close();
		},
	},
	{
		name: 'enableEdgeCache',
		label: 'Enable edge cache',
		callback: ( { close }: { close: () => void } ) => {
			close();
		},
	},
];
const mockStore = configureStore();
const store = mockStore( INITIAL_STATE );
const queryClient = new QueryClient();

jest.mock( '../../../state/selectors/get-current-route-pattern' );
jest.mock( '../../../state/command-palette/selectors' );
jest.mock( '../use-command-palette' );

window.ResizeObserver = jest.fn( () => ( {
	observe: jest.fn(),
	unobserve: jest.fn(),
	disconnect: jest.fn(),
} ) );

describe( 'CommandPalette', () => {
	( getCurrentRoutePattern as jest.Mock ).mockReturnValue( '/sites' );
	( isCommandPaletteOpen as jest.Mock ).mockReturnValue( false );

	const renderCommandPalette = () => {
		( useCommandPalette as jest.Mock ).mockReturnValue( {
			commands: commands,
			filterNotice: 'Mock Filter Notice',
			emptyListNotice: 'No results found',
		} );

		render(
			<Provider store={ store }>
				<QueryClientProvider client={ queryClient }>
					<CommandPalette />
				</QueryClientProvider>
			</Provider>
		);

		act( () => {
			fireEvent.keyDown( document, { key: 'k', metaKey: true } );
		} );
	};

	it( 'should confirm that the command palette opens with the commands from the commands array', () => {
		renderCommandPalette();

		expect( screen.getByPlaceholderText( 'Search for commands' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Get help' ) ).toBeInTheDocument();
	} );

	it( 'should return only "Get help" command as it matches label and "Send feedback" as it matches searchLabel; other commands are hidden', () => {
		renderCommandPalette();

		expect( screen.getByPlaceholderText( 'Search for commands' ) ).toBeInTheDocument();
		fireEvent.change( screen.getByPlaceholderText( 'Search for commands' ), {
			target: { value: 'help' },
		} );

		expect( screen.getByText( 'Get' ) ).toBeInTheDocument();
		expect( screen.getByText( 'help' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Send feedback' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Clear cache' ) ).toBeNull();
		expect( screen.queryByText( 'Enable edge cache' ) ).toBeNull();
	} );

	it( 'should return "No results found" when there is no match for search', () => {
		renderCommandPalette();

		expect( screen.getByPlaceholderText( 'Search for commands' ) ).toBeInTheDocument();
		fireEvent.change( screen.getByPlaceholderText( 'Search for commands' ), {
			target: { value: 'blue' },
		} );

		expect( screen.getByText( 'No results found' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Send feedback' ) ).toBeNull();
		expect( screen.queryByText( 'Clear cache' ) ).toBeNull();
		expect( screen.queryByText( 'Enable edge cache' ) ).toBeNull();
	} );

	it( 'should close the palette when you select a specific command with no nested commands', () => {
		renderCommandPalette();

		expect( screen.getByPlaceholderText( 'Search for commands' ) ).toBeInTheDocument();
		const getHelpCommand = screen.getByText( 'Get help' );
		fireEvent.click( getHelpCommand );

		expect( screen.queryByPlaceholderText( 'Search for commands' ) ).toBeNull();
	} );

	it( 'should close the command palette when cmd + k is pressed', () => {
		renderCommandPalette();

		const searchInput = screen.queryByPlaceholderText( 'Search for commands' );
		expect( searchInput ).toBeInTheDocument();

		fireEvent.keyDown( document, { key: 'k', metaKey: true } );

		expect( screen.queryByText( 'Get help' ) ).toBeNull();
	} );
} );
