/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { FediverseAccountView } from '../fediverse-account-view';
import { PROFILE_TAB, SETTINGS_TAB, TIMELINE_TAB } from '../helper';
import { getAccountUrl, getLandingUrl } from '../route';
import type React from 'react';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock( '@automattic/calypso-router', () => {
	const replace = jest.fn();
	const fn = jest.fn() as jest.Mock & { replace: jest.Mock };
	fn.replace = replace;
	return { __esModule: true, default: fn };
} );

jest.mock( 'calypso/reader/components/reader-main', () => ( {
	__esModule: true,
	default: function ReaderMain( { children }: { children: React.ReactNode } ) {
		return <div>{ children }</div>;
	},
} ) );

jest.mock( 'calypso/components/data/document-head', () => ( {
	__esModule: true,
	default: () => null,
} ) );

jest.mock( 'calypso/components/navigation-header', () => ( {
	__esModule: true,
	default: ( { title, subtitle }: { title: string; subtitle?: string } ) => (
		<div>
			<h1>{ title }</h1>
			{ subtitle && <p>{ subtitle }</p> }
		</div>
	),
} ) );

// Mock the navigation component.
jest.mock( '../fediverse-navigation', () => ( {
	FediverseNavigation: ( { selectedTab }: { selectedTab: string } ) => (
		<nav data-testid="fediverse-navigation" data-tab={ selectedTab } />
	),
} ) );

// Mock panel components.
jest.mock( '../timeline-panel', () => ( {
	TimelinePanel: ( { handle }: { handle: string } ) => (
		<div data-testid="timeline-panel">Timeline: { handle }</div>
	),
} ) );

jest.mock( '../profile-panel', () => ( {
	ProfilePanel: () => <div data-testid="profile-panel">Profile</div>,
} ) );

jest.mock( '../settings-panel', () => ( {
	SettingsPanel: () => <div data-testid="settings-panel">Settings</div>,
} ) );

// Mock composer.
jest.mock( '../composer', () => ( {
	ComposerProvider: ( { children }: { children: React.ReactNode } ) => <>{ children }</>,
	ComposerModal: () => null,
	ComposeFab: () => null,
} ) );

// Mock @wordpress/components to avoid the full package import.
jest.mock( '@wordpress/components', () => ( {
	__experimentalVStack: ( { children }: { children: React.ReactNode } ) => <div>{ children }</div>,
	Button: ( props: React.ButtonHTMLAttributes< HTMLButtonElement > ) => <button { ...props } />,
} ) );

// Mock i18n-calypso.
jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => ( str: string, options?: { args?: Record< string, string > } ) => {
		if ( options?.args ) {
			return Object.entries( options.args ).reduce(
				( result, [ key, value ] ) => result.replace( `%(${ key })s`, value ),
				str
			);
		}
		return str;
	},
} ) );

// Mock @automattic/api-queries entirely.
const mockUseFediverseConnectionsQuery = jest.fn();
jest.mock( '@automattic/api-queries', () => ( {
	useFediverseConnectionsQuery: ( ...args: unknown[] ) =>
		mockUseFediverseConnectionsQuery( ...args ),
} ) );

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

const CONNECTION = {
	id: 7,
	handle: '@alice@example.com',
	site_host: 'example.com',
	actor_url: 'https://example.com/users/alice',
	avatar: '',
	blog_id: 123,
	actor_type: 'user' as const,
};

function makeClient() {
	return new QueryClient( { defaultOptions: { queries: { retry: false } } } );
}

function renderView( connectionId: number, tab: string ) {
	const client = makeClient();
	const Wrapper = ( { children }: { children: React.ReactNode } ) => (
		<QueryClientProvider client={ client }>{ children }</QueryClientProvider>
	);
	return render( <FediverseAccountView connectionId={ connectionId } tab={ tab } />, {
		wrapper: Wrapper,
	} );
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

describe( 'FediverseAccountView', () => {
	beforeEach( () => {
		( page as unknown as jest.Mock ).mockClear();
		( page.replace as jest.Mock ).mockClear();
		mockUseFediverseConnectionsQuery.mockClear();
	} );

	// -------------------------------------------------------------------------
	// 1. Pending state
	// -------------------------------------------------------------------------

	it( 'shows Loading… while connections are pending', () => {
		mockUseFediverseConnectionsQuery.mockReturnValue( {
			data: undefined,
			isPending: true,
		} );

		renderView( 7, TIMELINE_TAB );

		expect( screen.getByRole( 'status' ) ).toHaveTextContent( 'Loading…' );
		expect( page.replace ).not.toHaveBeenCalled();
	} );

	// -------------------------------------------------------------------------
	// 2. No matching connection → redirect to landing
	// -------------------------------------------------------------------------

	it( 'redirects to landing URL when connection is not found', async () => {
		mockUseFediverseConnectionsQuery.mockReturnValue( {
			data: { connections: [ CONNECTION ] },
			isPending: false,
		} );

		renderView( 999, TIMELINE_TAB );

		await waitFor( () => expect( page.replace ).toHaveBeenCalledWith( getLandingUrl() ) );
	} );

	// -------------------------------------------------------------------------
	// 3. Invalid tab → redirect to timeline
	// -------------------------------------------------------------------------

	it( 'redirects to timeline when tab is invalid', async () => {
		mockUseFediverseConnectionsQuery.mockReturnValue( {
			data: { connections: [ CONNECTION ] },
			isPending: false,
		} );

		renderView( 7, 'nope' );

		await waitFor( () =>
			expect( page.replace ).toHaveBeenCalledWith( getAccountUrl( 7, TIMELINE_TAB ) )
		);
	} );

	// -------------------------------------------------------------------------
	// 4. Valid connection + valid tab → render panel + nav
	// -------------------------------------------------------------------------

	it( 'renders the timeline panel and navigation for a valid connection', async () => {
		mockUseFediverseConnectionsQuery.mockReturnValue( {
			data: { connections: [ CONNECTION ] },
			isPending: false,
		} );

		renderView( 7, TIMELINE_TAB );

		expect( await screen.findByTestId( 'timeline-panel' ) ).toBeVisible();
		expect( screen.getByTestId( 'fediverse-navigation' ) ).toBeVisible();
		expect( page.replace ).not.toHaveBeenCalled();
	} );

	it( 'renders the profile panel when tab is profile', async () => {
		mockUseFediverseConnectionsQuery.mockReturnValue( {
			data: { connections: [ CONNECTION ] },
			isPending: false,
		} );

		renderView( 7, PROFILE_TAB );

		expect( await screen.findByTestId( 'profile-panel' ) ).toBeVisible();
	} );

	it( 'renders the settings panel when tab is settings', async () => {
		mockUseFediverseConnectionsQuery.mockReturnValue( {
			data: { connections: [ CONNECTION ] },
			isPending: false,
		} );

		renderView( 7, SETTINGS_TAB );

		expect( await screen.findByTestId( 'settings-panel' ) ).toBeVisible();
	} );
} );
