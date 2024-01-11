/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { useCommandsArrayWpcom } from '../../../sites-dashboard/components/wpcom-smp-commands';
import { getCurrentRoutePattern } from '../../../state/selectors/get-current-route-pattern';
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

const commandsWithViewMySite = [
	{
		name: 'getHelp',
		label: 'Get help',
	},
	{
		name: 'clearCache',
		label: 'Clear cache',
	},
	{
		name: 'viewMySites',
		label: 'View my sites',
	},
	{
		name: 'enableEdgeCache',
		label: 'Enable edge cache',
	},
];

const commandsWithViewMySiteResult = [
	{
		name: 'viewMySites',
		label: 'View my sites',
	},
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

const commandsWithViewMySiteOnSitesResult = [
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

const commandsWithContext = [
	{
		name: 'getHelp',
		label: 'Get help',
		context: [ '/sites' ],
	},
	{
		name: 'clearCache',
		label: 'Clear cache',
		context: [ '/sites' ],
	},
	{
		name: 'enableEdgeCache',
		label: 'Enable edge cache',
		context: [ '/settings' ],
	},
];

const commandsWithContextResult = [
	{
		name: 'enableEdgeCache',
		label: 'Enable edge cache',
		context: [ '/settings' ],
	},
	{
		name: 'getHelp',
		label: 'Get help',
		context: [ '/sites' ],
	},
	{
		name: 'clearCache',
		label: 'Clear cache',
		context: [ '/sites' ],
	},
];

jest.mock( 'cmdk', () => ( {
	useCommandState: jest.fn(),
} ) );
jest.mock( '../../../sites-dashboard/components/wpcom-smp-commands', () => ( {
	useCommandsArrayWpcom: jest.fn(),
} ) );
jest.mock( '../../command-palette/use-current-site-rank-top' );
jest.mock( '../../../state/selectors/get-current-route-pattern' );

describe( 'useCommandPalette', () => {
	it( 'should return the commands in the order that they are added to the commands array with no change', () => {
		// Create a QueryClient instance
		const queryClient = new QueryClient();

		( useCurrentSiteRankTop as jest.Mock ).mockReturnValue( {
			currentSiteId: 1,
		} );

		( useCommandsArrayWpcom as jest.Mock ).mockReturnValue( commands );

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

		expect( result.current.commands.map( ( { name, label } ) => ( { name, label } ) ) ).toEqual(
			commands
		);
	} );

	it( 'should return the View My Sites command first before other commands from commandsWithViewMySite array', () => {
		// Create a QueryClient instance
		const queryClient = new QueryClient();

		( useCurrentSiteRankTop as jest.Mock ).mockReturnValue( {
			currentSiteId: 1,
		} );

		( useCommandsArrayWpcom as jest.Mock ).mockReturnValue( commandsWithViewMySite );

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

		expect( result.current.commands.map( ( { name, label } ) => ( { name, label } ) ) ).toEqual(
			commandsWithViewMySiteResult
		);
	} );

	it( 'should return all the commands in the order they are added to commandsWithViewMySiteOnSite; View My Site should be hidden in /sites context', () => {
		// Create a QueryClient instance
		const queryClient = new QueryClient();

		( useCurrentSiteRankTop as jest.Mock ).mockReturnValue( {
			currentSiteId: 1,
		} );
		( getCurrentRoutePattern as jest.Mock ).mockReturnValue( '/sites' );
		( useCommandsArrayWpcom as jest.Mock ).mockReturnValue( commandsWithViewMySite );

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

		expect( result.current.commands.map( ( { name, label } ) => ( { name, label } ) ) ).toEqual(
			commandsWithViewMySiteOnSitesResult
		);
	} );

	it( 'should return Enable Edge Cache command first as it matches the context; all other commands should follow in the order they are added to commandsWithContext array', () => {
		// Create a QueryClient instance
		const queryClient = new QueryClient();

		( useCurrentSiteRankTop as jest.Mock ).mockReturnValue( {
			currentSiteId: 1,
		} );
		( getCurrentRoutePattern as jest.Mock ).mockReturnValue( '/settings' );
		( useCommandsArrayWpcom as jest.Mock ).mockReturnValue( commandsWithContext );

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

		expect(
			result.current.commands.map( ( { name, label, context } ) => ( { name, label, context } ) )
		).toEqual( commandsWithContextResult );
	} );
} );
