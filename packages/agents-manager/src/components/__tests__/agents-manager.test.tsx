/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- `AgentsManager` must be imported after `jest.mock` */
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import type { AgentsManagerContextType } from '../../contexts';

// Capture context value passed by `AgentsManager`
let capturedProps: Record< string, unknown > | null = null;

// Packages that Jest can't resolve in this environment
vi.mock( '@automattic/agenttic-client', () => ( {} ) );
vi.mock( '@automattic/data-stores', () => ( {} ) );

// Simulate `store` ready so the component renders
vi.mock( '@wordpress/data', () => ( { useSelect: () => ( { hasLoaded: true } ) } ) );
vi.mock( '@tanstack/react-query', () => ( {
	QueryClient: vi.fn(),
	QueryClientProvider: ( { children }: { children: React.ReactNode } ) => children,
} ) );

// Intercept context provider to capture forwarded props. Return null so
// `AgentSetup` (its child) never mounts and pulls in heavy dependencies.
vi.mock( '../../contexts', () => ( {
	AgentsManagerContextProvider: ( { value }: { value: Record< string, unknown > } ) => {
		capturedProps = value;
		return null;
	},
} ) );

// Prevent transitive dependency chains from loading
vi.mock( '../../stores', () => ( { AGENTS_MANAGER_STORE: 'agents-manager' } ) );
vi.mock( '../../utils/create-agent-config', () => ( {} ) );
vi.mock( '../../hooks/use-agent-config', () => ( {} ) );
vi.mock( '../../hooks/use-open-chat-url-param', () => ( {
	useOpenChatUrlParam: () => true,
} ) );
vi.mock( '../../utils/load-external-providers', () => ( {} ) );
vi.mock( '../../hooks/use-empty-view-suggestions', () => ( {} ) );
vi.mock( '../agent-dock', () => ( { __esModule: true, default: () => null } ) );
vi.mock( 'react-router-dom', () => ( {} ) );

// Render children so the (mocked) context provider nested inside it is reached.
vi.mock( '../persistent-router', () => ( {
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
				isInternalOnly
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
				isInternalOnly: true,
				zendeskTicketProductFieldValue: 'woocommerce_core_product',
			} )
		);
	} );
} );
