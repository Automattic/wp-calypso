/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { useCommandPalette } from '../use-command-palette';
import { useCurrentSiteRankTop } from '../use-current-site-rank-top';

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
	preferences: {
		remoteValues: {
			'sites-sorting': 'alphabetically-asc',
		},
	},
	ui: {
		selectedSiteId: 1,
	},
};

const mockStore = configureStore();
const store = mockStore( INITIAL_STATE );

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

jest.mock( 'cmdk', () => ( {
	useCommandState: jest.fn(),
} ) );

// Mock the module that contains useCurrentSiteRankTop
jest.mock( '../../command-palette/use-current-site-rank-top' );

describe( 'useCommandPalette', () => {
	it( 'should return the commands in the expected order', () => {
		// Create a QueryClient instance
		const queryClient = new QueryClient();

		( useCurrentSiteRankTop as jest.Mock ).mockReturnValue( {
			currentSiteId: 1,
		} );

		// Wrap test logic within the QueryClientProvider and Provider
		const { result } = renderHook(
			() =>
				useCommandPalette( {
					selectedCommandName: '',
					setSelectedCommandName: () => {},
					search: '',
				} ),
			{
				wrapper: ( { children } ) => (
					<Provider store={ store }>
						<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
					</Provider>
				),
			}
		);

		// Assert that the hook returns the expected commands in the expected order
		expect( result.current.commands ).toEqual( commands );
	} );
} );
