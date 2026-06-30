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

// Intercept context provider to capture forwarded props. Return null so
// `AgentSetup` (its child) never mounts and pulls in heavy dependencies.
jest.mock( '../../contexts', () => ( {
	AgentsManagerContextProvider: ( { value }: { value: Record< string, unknown > } ) => {
		capturedProps = value;
		return null;
	},
} ) );

// Prevent transitive dependency chains from loading
jest.mock( '../../stores', () => ( { AGENTS_MANAGER_STORE: 'agents-manager' } ) );
jest.mock( '../../utils/create-agent-config', () => ( {} ) );
jest.mock( '../../hooks/use-agent-config', () => ( {} ) );
jest.mock( '../../utils/agent-session', () => ( {} ) );
jest.mock( '../../utils/load-external-providers', () => ( {} ) );
jest.mock( '../../hooks/use-empty-view-suggestions', () => ( {} ) );
jest.mock( '../agent-dock', () => ( { __esModule: true, default: () => null } ) );
jest.mock( 'react-router-dom', () => ( {} ) );

// Render children so the (mocked) context provider nested inside it is reached.
jest.mock( '../persistent-router', () => ( {
	PersistentRouter: ( { children }: { children: React.ReactNode } ) => children,
} ) );

import AgentsManager from '../agents-manager';

describe( 'AgentsManager', () => {
	it( 'forwards props to the context provider', () => {
		const mockUser = {
			ID: 789,
			username: 'fulltest',
			display_name: 'Full Test User',
			email: 'full@example.com',
		} as AgentsManagerContextType[ 'currentUser' ];

		const mockSite = { ID: 999, domain: 'fulltest.com' };

		render(
			<AgentsManager
				sectionName="site-editor"
				currentUser={ mockUser }
				site={ mockSite }
				currentRoute="/sites/fulltest.com"
				currentSiteId={ 999 }
				zendeskTicketProductFieldValue="woocommerce_core_product"
			/>
		);

		expect( capturedProps ).toEqual(
			expect.objectContaining( {
				sectionName: 'site-editor',
				currentUser: mockUser,
				site: mockSite,
				currentRoute: '/sites/fulltest.com',
				siteKey: '999',
				zendeskTicketProductFieldValue: 'woocommerce_core_product',
			} )
		);
	} );
} );
