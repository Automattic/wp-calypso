/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { useCommandPalette } from '../src/use-command-palette';

const defaultCommands = [
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

describe( 'useCommandPalette', () => {
	const queryClient = new QueryClient();

	const renderUseCommandPalette = ( { currentRoute = null, commands } ) =>
		renderHook(
			() =>
				useCommandPalette( {
					useCommands: () => commands,
					currentSiteId: 1,
					selectedCommandName: '',
					setSelectedCommandName: () => {},
					search: '',
					navigate: () => {},
					currentRoute,
					useSites: () => [],
					userCapabilities: {},
				} ),
			{
				wrapper: ( { children } ) => (
					<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
				),
			}
		);
	it( 'should return the commands in the order that they are added to the commands array with no change', () => {
		const { result } = renderUseCommandPalette( { commands: defaultCommands } );
		expect( result.current.commands.map( ( { name, label } ) => ( { name, label } ) ) ).toEqual(
			defaultCommands
		);
	} );

	it( 'should return the View My Sites command first before other commands from commandsWithViewMySite array when no context is specified', () => {
		const { result } = renderUseCommandPalette( { commands: commandsWithViewMySite } );

		expect( result.current.commands.map( ( { name, label } ) => ( { name, label } ) ) ).toEqual(
			commandsWithViewMySiteResult
		);
	} );

	it( 'should return all the commands in the order they are added to commandsWithViewMySiteOnSite; View My Site should be hidden in /sites context', () => {
		const { result } = renderUseCommandPalette( {
			currentRoute: '/sites',
			commands: commandsWithViewMySite,
		} );

		expect( result.current.commands.map( ( { name, label } ) => ( { name, label } ) ) ).toEqual(
			commandsWithViewMySiteOnSitesResult
		);
	} );

	it( 'should return Enable Edge Cache command first as it matches the context; all other commands should follow in the order they are added to commandsWithContext array', () => {
		const { result } = renderUseCommandPalette( {
			currentRoute: '/settings',
			commands: commandsWithContext,
		} );
		expect(
			result.current.commands.map( ( { name, label, context } ) => ( { name, label, context } ) )
		).toEqual( commandsWithContextResult );
	} );
} );
