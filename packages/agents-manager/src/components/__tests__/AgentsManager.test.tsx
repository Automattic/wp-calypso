/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- `AgentsManager` must be imported after `jest.mock` */
import { render } from '@testing-library/react';
import type { AgentsManagerContextType } from '../../contexts';

// Capture context value passed by `AgentsManager`
let capturedProps: Record< string, unknown > | null = null;

// Packages that Jest can't resolve in this environment
jest.mock( '@automattic/agenttic-client', () => ( {} ), { virtual: true } );
jest.mock( '@automattic/data-stores', () => ( {} ), { virtual: true } );

// Simulate `store` ready so the component renders
jest.mock( '@wordpress/data', () => ( { useSelect: () => ( { hasLoaded: true } ) } ) );
jest.mock( '@tanstack/react-query', () => ( {
	QueryClient: jest.fn(),
	QueryClientProvider: ( { children }: { children: React.ReactNode } ) => children,
} ) );

// Intercept context provider to capture forwarded props
jest.mock( '../../contexts', () => ( {
	AgentsManagerContextProvider: ( {
		value,
		children,
	}: {
		value: Record< string, unknown >;
		children: React.ReactNode;
	} ) => {
		capturedProps = value;
		return children;
	},
} ) );

// Prevent transitive dependency chains from loading
jest.mock( '../../stores', () => ( { AGENTS_MANAGER_STORE: 'agents-manager' } ) );
jest.mock( '../../utils/agent-config', () => ( {} ) );
jest.mock( '../../utils/agent-session', () => ( {} ) );
jest.mock( '../../utils/load-external-providers', () => ( {} ) );
jest.mock( '../../hooks/use-empty-view-suggestions', () => ( {} ) );
jest.mock( '../agent-dock', () => ( { __esModule: true, default: () => null } ) );
jest.mock( 'react-router-dom', () => ( {} ) );

// Render nothing so `AgentSetup` never mounts
jest.mock( '../persistent-router', () => ( { PersistentRouter: () => null } ) );

import AgentsManager from '../agents-manager';

describe( 'AgentsManager', () => {
	beforeEach( () => {
		capturedProps = null;
	} );

	it( 'forwards `sectionName`', () => {
		render( <AgentsManager sectionName="gutenberg" /> );

		expect( capturedProps ).toEqual( expect.objectContaining( { sectionName: 'gutenberg' } ) );
	} );

	it( 'forwards `currentUser`', () => {
		const mockUser = {
			ID: 123,
			username: 'testuser',
			display_name: 'Test User',
			email: 'test@example.com',
		} as AgentsManagerContextType[ 'currentUser' ];

		render( <AgentsManager sectionName="wp-admin" currentUser={ mockUser } /> );

		expect( capturedProps ).toEqual( expect.objectContaining( { currentUser: mockUser } ) );
	} );

	it( 'forwards `site`', () => {
		const mockSite = { ID: 456, domain: 'example.com' };

		render( <AgentsManager sectionName="wp-admin" site={ mockSite } /> );

		expect( capturedProps ).toEqual( expect.objectContaining( { site: mockSite } ) );
	} );

	it( 'forwards all props together', () => {
		const mockUser = {
			ID: 789,
			username: 'fulltest',
			display_name: 'Full Test User',
			email: 'full@example.com',
		} as AgentsManagerContextType[ 'currentUser' ];

		const mockSite = { ID: 999, domain: 'fulltest.com' };

		render(
			<AgentsManager sectionName="site-editor" currentUser={ mockUser } site={ mockSite } />
		);

		expect( capturedProps ).toEqual(
			expect.objectContaining( {
				sectionName: 'site-editor',
				currentUser: mockUser,
				site: mockSite,
			} )
		);
	} );
} );
