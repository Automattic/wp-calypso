/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import {
	AgentsManagerContextProvider,
	useAgentsManagerContext,
	type AgentsManagerContextType,
} from '../AgentsManagerContext';

// Test component that displays context values
function ContextConsumer() {
	const context = useAgentsManagerContext();
	return (
		<div>
			<span data-testid="sectionName">{ context.sectionName }</span>
			<span data-testid="isEligibleForChat">{ String( context.isEligibleForChat ) }</span>
			<span data-testid="userId">{ context.currentUser?.ID ?? 'none' }</span>
			<span data-testid="siteId">{ context.site?.ID ?? 'none' }</span>
		</div>
	);
}

describe( 'AgentsManagerContext', () => {
	describe( 'useAgentsManagerContext', () => {
		it( 'returns default values when used outside provider', () => {
			render( <ContextConsumer /> );

			expect( screen.getByTestId( 'sectionName' ).textContent ).toBe( 'wp-admin' );
			expect( screen.getByTestId( 'isEligibleForChat' ).textContent ).toBe( 'false' );
			expect( screen.getByTestId( 'userId' ).textContent ).toBe( 'none' );
			expect( screen.getByTestId( 'siteId' ).textContent ).toBe( 'none' );
		} );
	} );

	describe( 'AgentsManagerContextProvider', () => {
		it( 'provides sectionName to children', () => {
			render(
				<AgentsManagerContextProvider value={ { sectionName: 'gutenberg' } }>
					<ContextConsumer />
				</AgentsManagerContextProvider>
			);

			expect( screen.getByTestId( 'sectionName' ).textContent ).toBe( 'gutenberg' );
		} );

		it( 'provides currentUser to children', () => {
			const mockUser = {
				ID: 123,
				username: 'testuser',
				display_name: 'Test User',
				email: 'test@example.com',
			} as AgentsManagerContextType[ 'currentUser' ];

			render(
				<AgentsManagerContextProvider value={ { sectionName: 'wp-admin', currentUser: mockUser } }>
					<ContextConsumer />
				</AgentsManagerContextProvider>
			);

			expect( screen.getByTestId( 'userId' ).textContent ).toBe( '123' );
		} );

		it( 'provides site to children', () => {
			const mockSite = {
				ID: 456,
				domain: 'example.com',
			};

			render(
				<AgentsManagerContextProvider value={ { sectionName: 'wp-admin', site: mockSite } }>
					<ContextConsumer />
				</AgentsManagerContextProvider>
			);

			expect( screen.getByTestId( 'siteId' ).textContent ).toBe( '456' );
		} );

		it( 'uses default values for unspecified fields', () => {
			render(
				<AgentsManagerContextProvider value={ { sectionName: 'custom-section' } }>
					<ContextConsumer />
				</AgentsManagerContextProvider>
			);

			expect( screen.getByTestId( 'sectionName' ).textContent ).toBe( 'custom-section' );
			expect( screen.getByTestId( 'isEligibleForChat' ).textContent ).toBe( 'false' );
			expect( screen.getByTestId( 'userId' ).textContent ).toBe( 'none' );
			expect( screen.getByTestId( 'siteId' ).textContent ).toBe( 'none' );
		} );

		it( 'merges provided values with defaults', () => {
			const mockUser = { ID: 789 } as AgentsManagerContextType[ 'currentUser' ];

			render(
				<AgentsManagerContextProvider
					value={ {
						sectionName: 'wp-admin',
						currentUser: mockUser,
						// site not provided - should use default (null)
					} }
				>
					<ContextConsumer />
				</AgentsManagerContextProvider>
			);

			expect( screen.getByTestId( 'userId' ).textContent ).toBe( '789' );
			expect( screen.getByTestId( 'siteId' ).textContent ).toBe( 'none' );
		} );

		it( 'always returns isEligibleForChat as false (hardcoded)', () => {
			render(
				<AgentsManagerContextProvider value={ { sectionName: 'wp-admin' } }>
					<ContextConsumer />
				</AgentsManagerContextProvider>
			);

			expect( screen.getByTestId( 'isEligibleForChat' ).textContent ).toBe( 'false' );
		} );
	} );
} );
