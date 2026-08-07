/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import {
	AgentsManagerContextProvider,
	useAgentsManagerContext,
	type AgentsManagerContextProviderProps,
	type AgentsManagerContextType,
} from '../AgentsManagerContext';
import { saveSessionId, setSessionSiteKey } from '../../utils/agent-session';

// Test component that displays `context` values
function ContextConsumer() {
	const context = useAgentsManagerContext();
	return (
		<div>
			<span data-testid="sectionName">{ context.sectionName }</span>
			<span data-testid="isEligibleForChat">{ String( context.isEligibleForChat ) }</span>
			<span data-testid="isLoggedIn">{ String( context.isLoggedIn ) }</span>
			<span data-testid="userId">{ context.currentUser?.ID ?? 'none' }</span>
			<span data-testid="siteId">{ context.site?.ID ?? 'none' }</span>
			<span data-testid="tabSessionId">{ context.getTabSessionId() }</span>
		</div>
	);
}

// The provider calls `useNavigate`, so render it inside a router.
function renderWithProvider( value: AgentsManagerContextProviderProps[ 'value' ] ) {
	return render(
		<MemoryRouter>
			<AgentsManagerContextProvider value={ value }>
				<ContextConsumer />
			</AgentsManagerContextProvider>
		</MemoryRouter>
	);
}

describe( 'AgentsManagerContext', () => {
	describe( 'useAgentsManagerContext', () => {
		it( 'returns default values when used outside provider', () => {
			render( <ContextConsumer /> );

			expect( screen.getByTestId( 'sectionName' ).textContent ).toBe( 'wp-admin' );
			expect( screen.getByTestId( 'isEligibleForChat' ).textContent ).toBe( 'false' );
			expect( screen.getByTestId( 'isLoggedIn' ).textContent ).toBe( 'false' );
			expect( screen.getByTestId( 'userId' ).textContent ).toBe( 'none' );
			expect( screen.getByTestId( 'siteId' ).textContent ).toBe( 'none' );
		} );
	} );

	describe( 'AgentsManagerContextProvider', () => {
		it( 'provides `sectionName` to children', () => {
			renderWithProvider( { sectionName: 'gutenberg', siteKey: 'no-site' } );

			expect( screen.getByTestId( 'sectionName' ).textContent ).toBe( 'gutenberg' );
		} );

		it( 'provides `currentUser` to children', () => {
			const mockUser = {
				ID: 123,
				username: 'testuser',
				display_name: 'Test User',
				email: 'test@example.com',
			} as AgentsManagerContextType[ 'currentUser' ];

			renderWithProvider( { sectionName: 'wp-admin', siteKey: 'no-site', currentUser: mockUser } );

			expect( screen.getByTestId( 'userId' ).textContent ).toBe( '123' );
		} );

		it( 'provides `site` to children', () => {
			const mockSite = {
				ID: 456,
				domain: 'example.com',
			};

			renderWithProvider( { sectionName: 'wp-admin', siteKey: '456', site: mockSite } );

			expect( screen.getByTestId( 'siteId' ).textContent ).toBe( '456' );
		} );

		it( 'uses default values for unspecified fields', () => {
			renderWithProvider( { sectionName: 'custom-section', siteKey: 'no-site' } );

			expect( screen.getByTestId( 'sectionName' ).textContent ).toBe( 'custom-section' );
			expect( screen.getByTestId( 'isEligibleForChat' ).textContent ).toBe( 'false' );
			expect( screen.getByTestId( 'isLoggedIn' ).textContent ).toBe( 'false' );
			expect( screen.getByTestId( 'userId' ).textContent ).toBe( 'none' );
			expect( screen.getByTestId( 'siteId' ).textContent ).toBe( 'none' );
		} );

		it( 'derives `isLoggedIn` as `true` when `currentUser` has an `ID`', () => {
			const mockUser = { ID: 123 } as AgentsManagerContextType[ 'currentUser' ];

			renderWithProvider( { sectionName: 'wp-admin', siteKey: 'no-site', currentUser: mockUser } );

			expect( screen.getByTestId( 'isLoggedIn' ).textContent ).toBe( 'true' );
		} );

		it( 'derives `isLoggedIn` as `false` when `currentUser` is not provided', () => {
			renderWithProvider( { sectionName: 'wp-admin', siteKey: 'no-site' } );

			expect( screen.getByTestId( 'isLoggedIn' ).textContent ).toBe( 'false' );
		} );

		it( 'merges provided values with defaults', () => {
			const mockUser = { ID: 789 } as AgentsManagerContextType[ 'currentUser' ];

			renderWithProvider( {
				sectionName: 'wp-admin',
				siteKey: 'no-site',
				currentUser: mockUser,
				// `site` not provided - should use default (`null`)
			} );

			expect( screen.getByTestId( 'userId' ).textContent ).toBe( '789' );
			expect( screen.getByTestId( 'siteId' ).textContent ).toBe( 'none' );
		} );

		it( 'always returns `isEligibleForChat` as `false` (hardcoded)', () => {
			renderWithProvider( { sectionName: 'wp-admin', siteKey: 'no-site' } );

			expect( screen.getByTestId( 'isEligibleForChat' ).textContent ).toBe( 'false' );
		} );

		it( 'returns empty string from `getTabSessionId` when no agentConfig is set', () => {
			renderWithProvider( { sectionName: 'wp-admin', siteKey: 'no-site' } );

			expect( screen.getByTestId( 'tabSessionId' ).textContent ).toBe( '' );
		} );

		it( 'resumes the chat for this tab by navigating to `/chat`', () => {
			function ResumeProbe() {
				const { resumeChat } = useAgentsManagerContext();
				const location = useLocation();
				return (
					<>
						<button onClick={ resumeChat }>resume</button>
						<span data-testid="path">{ location.pathname }</span>
					</>
				);
			}

			render(
				<MemoryRouter>
					<AgentsManagerContextProvider value={ { sectionName: 'wp-admin', siteKey: 'no-site' } }>
						<ResumeProbe />
					</AgentsManagerContextProvider>
				</MemoryRouter>
			);

			fireEvent.click( screen.getByText( 'resume' ) );

			expect( screen.getByTestId( 'path' ).textContent ).toBe( '/chat' );
		} );
	} );

	describe( 'tab session resolution', () => {
		afterEach( () => {
			sessionStorage.clear();
			setSessionSiteKey( 'no-site' );
		} );

		it( 'reads the tab session for the provider’s site, following site switches', () => {
			setSessionSiteKey( '111' );
			saveSessionId( 'session-site-111' );
			setSessionSiteKey( '456' );
			saveSessionId( 'session-site-456' );

			const { rerender } = renderWithProvider( { sectionName: 'wp-admin', siteKey: '111' } );

			expect( screen.getByTestId( 'tabSessionId' ).textContent ).toBe( 'session-site-111' );

			// Switching sites re-renders the provider with a new `siteKey`; children
			// must read the new site's session in the same pass.
			rerender(
				<MemoryRouter>
					<AgentsManagerContextProvider value={ { sectionName: 'wp-admin', siteKey: '456' } }>
						<ContextConsumer />
					</AgentsManagerContextProvider>
				</MemoryRouter>
			);

			expect( screen.getByTestId( 'tabSessionId' ).textContent ).toBe( 'session-site-456' );
		} );
	} );
} );
