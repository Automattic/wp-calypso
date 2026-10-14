/**
 * @jest-environment jsdom
 */

import { omnibarAgentsManagerEnabledQuery, queryClient } from '@automattic/api-queries';
import { act, render, waitFor } from '@testing-library/react';
import AsyncLoad from 'calypso/components/async-load';
import { createToolProvider } from 'calypso/my-sites/plugins/marketplace-ai-experience/agent-provider';
import {
	deliverPicks,
	setPicks,
} from 'calypso/my-sites/plugins/marketplace-ai-experience/picks-store';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getSelectedSite, getSelectedSiteSlug, isSiteSection } from 'calypso/state/ui/selectors';
import AgentsManagerLoader from '../agents-manager-loader';
import { useHelpCenterSite } from '../use-help-center-site';

jest.mock( 'react-redux', () => ( { useSelector: ( selector ) => selector() } ) );
jest.mock( 'calypso/state', () => {
	const store = { getState: () => ( {} ) };
	return { useStore: () => store };
} );
jest.mock( 'calypso/components/async-load', () => jest.fn( () => null ) );
jest.mock( 'calypso/state/current-user/selectors', () => ( { getCurrentUser: jest.fn() } ) );
jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSite: jest.fn(),
	getSelectedSiteSlug: jest.fn(),
	isSiteSection: jest.fn(),
} ) );
jest.mock( '../use-help-center-site', () => ( { useHelpCenterSite: jest.fn() } ) );
jest.mock( 'calypso/my-sites/plugins/marketplace-ai-experience/agent-provider', () => ( {
	createToolProvider: jest.fn( ( options ) => options ),
} ) );
jest.mock( 'calypso/my-sites/plugins/marketplace-ai-experience/picks-store', () => ( {
	deliverPicks: jest.fn(),
	setPicks: jest.fn(),
} ) );

const selectedSite = { ID: 1 };
const primarySite = { ID: 2 };
const user = { ID: 3 };
const loadedProps = () => AsyncLoad.mock.calls.at( -1 )[ 0 ];

beforeEach( () => {
	jest.clearAllMocks();
	queryClient.setQueryData( omnibarAgentsManagerEnabledQuery().queryKey, false );
	delete window.agentsManagerData;
	getCurrentUser.mockReturnValue( user );
	getSelectedSite.mockReturnValue( selectedSite );
	getSelectedSiteSlug.mockReturnValue( 'first.wordpress.com' );
	isSiteSection.mockReturnValue( false );
	useHelpCenterSite.mockReturnValue( { selectedSite, site: primarySite } );
} );

it( 'registers the plugin provider before mounting and delivers picks to the current site', async () => {
	const existingProvider = {};
	window.agentsManagerData = { agentProviders: [ existingProvider ] };
	queryClient.setQueryData( omnibarAgentsManagerEnabledQuery().queryKey, true );
	const { rerender } = render( <AgentsManagerLoader sectionName="plugins" isInternalOnly /> );

	expect( AsyncLoad ).not.toHaveBeenCalled();
	expect( queryClient.getQueryData( omnibarAgentsManagerEnabledQuery().queryKey ) ).toBe( false );
	await waitFor( () => expect( AsyncLoad ).toHaveBeenCalled() );
	expect( queryClient.getQueryData( omnibarAgentsManagerEnabledQuery().queryKey ) ).toBe( true );
	expect( window.agentsManagerData.agentProviders ).toEqual( [
		existingProvider,
		{ toolProvider: createToolProvider.mock.results[ 0 ].value },
	] );
	expect( loadedProps() ).toMatchObject( {
		currentUser: user,
		sectionName: 'plugins',
		site: selectedSite,
		currentSiteId: 1,
		isInternalOnly: true,
	} );

	expect( loadedProps().agentId ).toBeUndefined();

	setPicks.mockClear();
	getSelectedSite.mockReturnValue( { ID: 4 } );
	getSelectedSiteSlug.mockReturnValue( 'second.wordpress.com' );
	useHelpCenterSite.mockReturnValue( { selectedSite: { ID: 4 }, site: primarySite } );
	rerender( <AgentsManagerLoader sectionName="plugins" isInternalOnly /> );
	expect( setPicks ).toHaveBeenCalledWith( [] );

	const picks = [ { slug: 'woocommerce', why: 'Sell products' } ];
	createToolProvider.mock.calls[ 0 ][ 0 ].onPicks( picks );
	expect( deliverPicks ).toHaveBeenCalledWith( picks, 'second.wordpress.com' );
	expect( window.agentsManagerData.agentProviders ).toHaveLength( 2 );
} );

it( 'preserves shared loader behavior outside plugins and initializes plugins on navigation', async () => {
	const { rerender } = render( <AgentsManagerLoader sectionName="hosting" isInternalOnly /> );
	expect( loadedProps() ).toMatchObject( {
		site: primarySite,
		currentSiteId: undefined,
		isInternalOnly: true,
	} );
	expect( window.agentsManagerData ).toBeUndefined();
	expect( setPicks ).not.toHaveBeenCalled();

	isSiteSection.mockReturnValue( true );
	rerender( <AgentsManagerLoader sectionName="hosting" /> );
	expect( loadedProps().currentSiteId ).toBe( 1 );

	rerender( <AgentsManagerLoader sectionName="plugins" /> );
	await waitFor( () => expect( loadedProps().sectionName ).toBe( 'plugins' ) );
	expect( window.agentsManagerData.agentProviders ).toHaveLength( 1 );
} );

it( 'does not fall back to the primary site on global plugin pages', async () => {
	getSelectedSite.mockReturnValue( null );
	useHelpCenterSite.mockReturnValue( { selectedSite: null, site: primarySite } );
	render( <AgentsManagerLoader sectionName="plugins" /> );
	await waitFor( () => expect( AsyncLoad ).toHaveBeenCalled() );
	expect( loadedProps() ).toMatchObject( { site: null, currentSiteId: undefined } );
} );

it( 'does not register a provider or mount plugins for logged-out users', async () => {
	getCurrentUser.mockReturnValue( null );
	await act( async () => {
		render( <AgentsManagerLoader sectionName="plugins" /> );
	} );
	expect( AsyncLoad ).not.toHaveBeenCalled();
	expect( window.agentsManagerData ).toBeUndefined();
} );

it( 'removes section tools on navigation and restores them without duplicates', async () => {
	const existingProvider = {};
	window.agentsManagerData = { agentProviders: [ existingProvider ] };
	const { rerender, unmount } = render( <AgentsManagerLoader sectionName="plugins" /> );
	await waitFor( () => expect( AsyncLoad ).toHaveBeenCalled() );
	const pluginProvider = window.agentsManagerData.agentProviders[ 1 ];

	rerender( <AgentsManagerLoader sectionName="hosting" /> );
	expect( window.agentsManagerData.agentProviders ).toEqual( [ existingProvider ] );
	expect( loadedProps().sectionName ).toBe( 'hosting' );

	rerender( <AgentsManagerLoader sectionName="plugins" /> );
	await waitFor( () => expect( loadedProps().sectionName ).toBe( 'plugins' ) );
	expect( window.agentsManagerData.agentProviders ).toEqual( [ existingProvider, pluginProvider ] );

	unmount();
	expect( window.agentsManagerData.agentProviders ).toEqual( [ existingProvider ] );
	expect( queryClient.getQueryData( omnibarAgentsManagerEnabledQuery().queryKey ) ).toBe( false );
} );

it( 'ignores a provider that finishes loading after leaving its section', async () => {
	const { rerender } = render( <AgentsManagerLoader sectionName="plugins" /> );
	rerender( <AgentsManagerLoader sectionName="hosting" /> );
	await act( async () => {} );
	expect( window.agentsManagerData ).toBeUndefined();
	expect( loadedProps().sectionName ).toBe( 'hosting' );
} );

it( 'removes section tools and stops rendering when the user logs out', async () => {
	const { rerender } = render( <AgentsManagerLoader sectionName="plugins" /> );
	await waitFor( () => expect( AsyncLoad ).toHaveBeenCalled() );
	expect( queryClient.getQueryData( omnibarAgentsManagerEnabledQuery().queryKey ) ).toBe( true );
	AsyncLoad.mockClear();
	getCurrentUser.mockReturnValue( null );
	rerender( <AgentsManagerLoader sectionName="plugins" /> );
	expect( AsyncLoad ).not.toHaveBeenCalled();
	expect( window.agentsManagerData.agentProviders ).toEqual( [] );
	expect( queryClient.getQueryData( omnibarAgentsManagerEnabledQuery().queryKey ) ).toBe( false );
} );
