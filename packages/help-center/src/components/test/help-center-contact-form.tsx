/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { HelpCenterRequiredContextProvider } from '../../contexts/HelpCenterContext';
import { HelpCenterContactForm } from '../help-center-contact-form';

vi.mock( 'react-router-dom', async () => ( {
	...( await vi.importActual< typeof import( 'react-router-dom' ) >( 'react-router-dom' ) ),
	useNavigate: () => vi.fn(),
} ) );

vi.mock( '../../data/use-user-sites', () => ( {
	useUserSites: () => ( { data: { sites: [] } } ),
} ) );

vi.mock( '../../data/use-site-analysis', () => ( {
	useSiteAnalysis: () => ( { result: 'LOADING' } ),
} ) );

vi.mock( '../../data/use-submit-support-ticket', () => ( {
	useSubmitTicketMutation: () => ( { isPending: false, mutateAsync: vi.fn() } ),
} ) );

vi.mock( '../../data/use-jetpack-search-ai', () => ( {
	useJetpackSearchAIQuery: () => ( { isFetching: false, isError: false } ),
} ) );

vi.mock( '@automattic/odie-client/src/data/use-current-support-interaction', () => ( {
	useCurrentSupportInteraction: () => ( { data: null } ),
} ) );

vi.mock( '@automattic/odie-client/src/utils', () => ( {
	getOdieIdFromInteraction: () => null,
} ) );

vi.mock( '@automattic/calypso-analytics', async () => ( {
	...( await vi.importActual< typeof import( '@automattic/calypso-analytics' ) >(
		'@automattic/calypso-analytics'
	) ),
	recordTracksEvent: vi.fn(),
} ) );

// @wordpress/components is imported directly by the contact form.  The
// calypso:src resolver bypasses moduleNameMapper for @wordpress/* packages,
// so we mock it here instead.
vi.mock( '@wordpress/components', () => ( {
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
vi.mock( '../help-center-gpt', () => ( { HelpCenterGPT: () => null } ) );
vi.mock( '../help-center-search-results', () => ( { __esModule: true, default: () => null } ) );
vi.mock( '../help-center-site-picker', () => ( { HelpCenterSitePicker: () => null } ) );

// Override the global jestSetup mock so `config.isEnabled` is callable.
vi.mock( '@automattic/calypso-config', () => {
	const cfg = ( key: string ) => key;
	cfg.isEnabled = () => false;
	return { __esModule: true, default: cfg };
} );

vi.mock( '@wordpress/data', () => ( {
	useSelect: ( cb: ( select: ( store: string ) => unknown ) => unknown ) => {
		// Return the shape that HELP_CENTER_STORE selectors produce.
		return cb( () => ( {
			getSubject: () => '',
			getMessage: () => '',
			getUserDeclaredSiteUrl: () => '',
		} ) );
	},
	useDispatch: () => ( {
		resetStore: vi.fn(),
		setUserDeclaredSite: vi.fn(),
		setSubject: vi.fn(),
		setMessage: vi.fn(),
	} ),
	register: vi.fn(),
	createReduxStore: vi.fn(),
} ) );

vi.mock( 'calypso/lib/formatting', () => ( {
	preventWidows: ( s: string ) => s,
} ) );

vi.mock( 'calypso/lib/mobile-app', () => ( {
	isWcMobileApp: () => false,
} ) );

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

describe( 'HelpCenterContactForm - logged-out user (null currentUser)', () => {
	it( 'does not throw when currentUser is null (logged-out user)', () => {
		const consoleError = vi.spyOn( console, 'error' ).mockImplementation( () => {} );

		expect( () => {
			renderContactForm( null );
		} ).not.toThrow();

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
