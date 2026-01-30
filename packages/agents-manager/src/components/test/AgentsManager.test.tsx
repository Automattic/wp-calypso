/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- AgentsManager must be imported after jest.mock */
import { render, screen } from '@testing-library/react';
import type { AgentsManagerContextType } from '../../contexts';

// Store context values captured by the mock
let mockCapturedContext: AgentsManagerContextType | null = null;

// Mock UnifiedAIAgent to avoid complex dependencies and capture context
jest.mock( '../unified-ai-agent', () => ( {
	__esModule: true,
	default: function MockUnifiedAIAgent() {
		// Import context hook inside mock (allowed with require)
		const { useAgentsManagerContext } = require( '../../contexts' );
		mockCapturedContext = useAgentsManagerContext();
		return (
			<div data-testid="mock-unified-agent">
				<span data-testid="context-sectionName">{ mockCapturedContext.sectionName }</span>
				<span data-testid="context-userId">{ mockCapturedContext.currentUser?.ID ?? 'none' }</span>
				<span data-testid="context-siteId">{ mockCapturedContext.site?.ID ?? 'none' }</span>
				<span data-testid="context-siteDomain">{ mockCapturedContext.site?.domain ?? 'none' }</span>
				<span data-testid="context-isEligibleForChat">
					{ String( mockCapturedContext.isEligibleForChat ) }
				</span>
			</div>
		);
	},
} ) );

// Import AgentsManager after mocking UnifiedAIAgent
import AgentsManager from '../agents-manager';

describe( 'AgentsManager', () => {
	beforeEach( () => {
		mockCapturedContext = null;
	} );

	it( 'provides sectionName to child components via context', () => {
		render( <AgentsManager sectionName="gutenberg" /> );

		expect( screen.getByTestId( 'context-sectionName' ).textContent ).toBe( 'gutenberg' );
	} );

	it( 'provides currentUser to child components via context', () => {
		const mockUser = {
			ID: 123,
			username: 'testuser',
			display_name: 'Test User',
			email: 'test@example.com',
		} as AgentsManagerContextType[ 'currentUser' ];

		render( <AgentsManager sectionName="wp-admin" currentUser={ mockUser } /> );

		expect( screen.getByTestId( 'context-userId' ).textContent ).toBe( '123' );
	} );

	it( 'provides site to child components via context', () => {
		const mockSite = {
			ID: 456,
			domain: 'example.com',
		};

		render( <AgentsManager sectionName="wp-admin" site={ mockSite } /> );

		expect( screen.getByTestId( 'context-siteId' ).textContent ).toBe( '456' );
		expect( screen.getByTestId( 'context-siteDomain' ).textContent ).toBe( 'example.com' );
	} );

	it( 'uses default values for unspecified context fields', () => {
		render( <AgentsManager sectionName="wp-admin" /> );

		expect( screen.getByTestId( 'context-sectionName' ).textContent ).toBe( 'wp-admin' );
		expect( screen.getByTestId( 'context-userId' ).textContent ).toBe( 'none' );
		expect( screen.getByTestId( 'context-siteId' ).textContent ).toBe( 'none' );
		expect( screen.getByTestId( 'context-isEligibleForChat' ).textContent ).toBe( 'false' );
	} );

	it( 'provides all props together to child components', () => {
		const mockUser = {
			ID: 789,
			username: 'fulltest',
			display_name: 'Full Test User',
			email: 'full@example.com',
		} as AgentsManagerContextType[ 'currentUser' ];

		const mockSite = {
			ID: 999,
			domain: 'fulltest.com',
		};

		render(
			<AgentsManager sectionName="site-editor" currentUser={ mockUser } site={ mockSite } />
		);

		expect( screen.getByTestId( 'context-sectionName' ).textContent ).toBe( 'site-editor' );
		expect( screen.getByTestId( 'context-userId' ).textContent ).toBe( '789' );
		expect( screen.getByTestId( 'context-siteId' ).textContent ).toBe( '999' );
		expect( screen.getByTestId( 'context-siteDomain' ).textContent ).toBe( 'fulltest.com' );
	} );
} );
