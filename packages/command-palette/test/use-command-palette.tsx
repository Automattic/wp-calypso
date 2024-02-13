/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { useCommandPalette } from '../src/use-command-palette';
import { useCommands } from '../src/use-commands';
import { useSites } from '../src/use-sites';
import { useSitesSortingQuery } from '../src/use-sites-sorting-query';

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
jest.mock( '../src/use-commands', () => ( {
	useCommands: jest.fn(),
} ) );
jest.mock( '../src/use-sites-sorting-query', () => ( {
	useSitesSortingQuery: jest.fn(),
} ) );
jest.mock( '../src/use-sites', () => ( {
	useSites: jest.fn(),
} ) );

describe( 'useCommandPalette', () => {
	const queryClient = new QueryClient();
	( useSitesSortingQuery as jest.Mock ).mockReturnValue( {
		data: {
			sortKey: 'alphabetically',
			sortOrder: 'asc',
		},
	} );
	( useSites as jest.Mock ).mockReturnValue( {
		data: [],
	} );

	const wpcom = {
		req: {
			get: () => {},
		},
	};

	const renderUseCommandPalette = ( currentRoute = null ) =>
		renderHook(
			() =>
				useCommandPalette( {
					currentSiteId: 1,
					selectedCommandName: '',
					setSelectedCommandName: () => {},
					search: '',
					navigate: () => {},
					wpcom: wpcom,
					currentRoute,
				} ),
			{
				wrapper: ( { children } ) => (
					<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
				),
			}
		);
	it( 'should return the commands in the order that they are added to the commands array with no change', () => {
		( useCommands as jest.Mock ).mockReturnValue( commands );
		const { result } = renderUseCommandPalette();
		expect( result.current.commands.map( ( { name, label } ) => ( { name, label } ) ) ).toEqual(
			commands
		);
	} );

	it( 'should return the View My Sites command first before other commands from commandsWithViewMySite array when no context is specified', () => {
		( useCommands as jest.Mock ).mockReturnValue( commandsWithViewMySite );
		const { result } = renderUseCommandPalette();

		expect( result.current.commands.map( ( { name, label } ) => ( { name, label } ) ) ).toEqual(
			commandsWithViewMySiteResult
		);
	} );

	it( 'should return all the commands in the order they are added to commandsWithViewMySiteOnSite; View My Site should be hidden in /sites context', () => {
		( useCommands as jest.Mock ).mockReturnValue( commandsWithViewMySite );
		const { result } = renderUseCommandPalette( '/sites' );

		expect( result.current.commands.map( ( { name, label } ) => ( { name, label } ) ) ).toEqual(
			commandsWithViewMySiteOnSitesResult
		);
	} );

	it( 'should return Enable Edge Cache command first as it matches the context; all other commands should follow in the order they are added to commandsWithContext array', () => {
		( useCommands as jest.Mock ).mockReturnValue( commandsWithContext );

		const { result } = renderUseCommandPalette( '/settings' );
		expect(
			result.current.commands.map( ( { name, label, context } ) => ( { name, label, context } ) )
		).toEqual( commandsWithContextResult );
	} );
} );
