/**
 * @jest-environment jsdom
 */

/**
 * Regression test for:
 * DOTSUP-452 – HelpCenterContactForm crashes with TypeError when currentUser is null
 *
 * HelpCenterLoader now renders for logged-out users on devdocs pages.
 * The loader passes currentUser straight through even when it is null.
 * HelpCenterContactForm then accesses currentUser.ID without a null-check,
 * throwing:
 *   TypeError: Cannot read properties of null (reading 'ID')
 *
 * Affected paths:
 *   client/layout/logged-out.jsx
 *   client/layout/help-center-loader.tsx
 *   client/state/current-user/selectors.js
 *   packages/help-center/src/components/help-center-contact-form.tsx
 *
 * Commit: 788e1211f727
 */

import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { HelpCenterRequiredContextProvider } from '../../contexts/HelpCenterContext';
import { HelpCenterContactForm } from '../help-center-contact-form';

// ---------------------------------------------------------------------------
// Module mocks – keep the component mountable in jsdom without real API calls
// ---------------------------------------------------------------------------
// Note: @automattic/onboarding and @automattic/data-stores are mapped to
// lightweight stubs in jest.config.js#moduleNameMapper, which removes the
// need to mock the entire transitive dependency tree here.

jest.mock( 'react-router-dom', () => ( {
	...jest.requireActual( 'react-router-dom' ),
	useNavigate: () => jest.fn(),
} ) );

jest.mock( '../../data/use-user-sites', () => ( {
	useUserSites: () => ( { data: { sites: [] } } ),
} ) );

jest.mock( '../../data/use-site-analysis', () => ( {
	useSiteAnalysis: () => ( { result: 'LOADING' } ),
} ) );

jest.mock( '../../data/use-submit-support-ticket', () => ( {
	useSubmitTicketMutation: () => ( { isPending: false, mutateAsync: jest.fn() } ),
} ) );

jest.mock( '../../data/use-jetpack-search-ai', () => ( {
	useJetpackSearchAIQuery: () => ( { isFetching: false, isError: false } ),
} ) );

jest.mock( '@automattic/odie-client/src/data/use-current-support-interaction', () => ( {
	useCurrentSupportInteraction: () => ( { data: null } ),
} ) );

jest.mock( '@automattic/odie-client/src/utils', () => ( {
	getOdieIdFromInteraction: () => null,
} ) );

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

// @wordpress/components is imported directly by the contact form.  The
// calypso:src resolver bypasses moduleNameMapper for @wordpress/* packages,
// so we mock it here instead.
jest.mock( '@wordpress/components', () => ( {
	Button: ( { children, onClick, disabled }: React.ComponentProps< 'button' > ) => (
		<button onClick={ onClick } disabled={ disabled }>
			{ children }
		</button>
	),
	TextControl: ( {
		value,
		onChange,
		label,
	}: {
		value: string;
		onChange: () => void;
		label: string;
	} ) => <input value={ value } onChange={ onChange } aria-label={ label } />,
	Tip: ( { children }: { children: React.ReactNode } ) => <div>{ children }</div>,
} ) );

// Sibling components with deep dependency chains (odie-client → react-markdown
// ESM, @wordpress/rich-text, etc.).
jest.mock( '../help-center-gpt', () => ( { HelpCenterGPT: () => null } ) );
jest.mock( '../help-center-search-results', () => ( { __esModule: true, default: () => null } ) );
jest.mock( '../help-center-site-picker', () => ( { HelpCenterSitePicker: () => null } ) );

// Override the global jestSetup mock so `config.isEnabled` is callable.
jest.mock( '@automattic/calypso-config', () => {
	const cfg = ( key: string ) => key;
	cfg.isEnabled = () => false;
	return { __esModule: true, default: cfg };
} );

jest.mock( '@wordpress/data', () => ( {
	useSelect: ( cb: ( select: ( store: string ) => unknown ) => unknown ) => {
		// Return the shape that HELP_CENTER_STORE selectors produce.
		return cb( () => ( {
			getSubject: () => '',
			getMessage: () => '',
			getUserDeclaredSiteUrl: () => '',
		} ) );
	},
	useDispatch: () => ( {
		resetStore: jest.fn(),
		setUserDeclaredSite: jest.fn(),
		setSubject: jest.fn(),
		setMessage: jest.fn(),
	} ),
	register: jest.fn(),
	createReduxStore: jest.fn(),
} ) );

jest.mock( 'calypso/lib/formatting', () => ( {
	preventWidows: ( s: string ) => s,
} ) );

jest.mock( 'calypso/lib/mobile-app', () => ( {
	isWcMobileApp: () => false,
} ) );

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Renders HelpCenterContactForm wrapped in the mandatory context and router,
 * using the supplied currentUser value (may be null to simulate a logged-out
 * visitor).
 */
function renderContactForm( currentUser: unknown ) {
	return render(
		<HelpCenterRequiredContextProvider
			value={ {
				// Cast needed: the type declaration requires a full CurrentUser object,
				// but the bug path passes null – that is exactly what we are testing.
				currentUser: currentUser as any, // eslint-disable-line @typescript-eslint/no-explicit-any
				sectionName: 'devdocs',
			} }
		>
			<MemoryRouter initialEntries={ [ '/contact-form' ] }>
				<HelpCenterContactForm />
			</MemoryRouter>
		</HelpCenterRequiredContextProvider>
	);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe( 'HelpCenterContactForm – logged-out user (null currentUser)', () => {
	/**
	 * This test reproduces the TypeError reported in DOTSUP-452.
	 *
	 * Before the fix, passing null as currentUser causes the component to throw:
	 *   TypeError: Cannot read properties of null (reading 'ID')
	 * at the very first render because the component accesses `currentUser.ID`
	 * unconditionally on lines:
	 *   - useUserSites( currentUser.ID )
	 *   - useSiteAnalysis( currentUser.ID, … )
	 *   - queryClient.invalidateQueries( { queryKey: [ …, currentUser.ID ] } )
	 *
	 * After the fix (null-guard / optional chaining), the component must render
	 * without throwing.
	 */
	it( 'throws a TypeError when currentUser is null (regression – must be fixed)', () => {
		// Suppress the expected React error boundary console output so the test
		// output stays readable.
		const consoleError = jest.spyOn( console, 'error' ).mockImplementation( () => {} );

		expect( () => {
			renderContactForm( null );
		} ).toThrow( TypeError );

		consoleError.mockRestore();
	} );

	it( 'does NOT throw when currentUser is a valid logged-in user object', () => {
		const validUser = {
			ID: 12345,
			display_name: 'Test User',
			email: 'test@example.com',
		};

		expect( () => {
			renderContactForm( validUser );
		} ).not.toThrow();
	} );
} );
