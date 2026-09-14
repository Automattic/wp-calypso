/**
 * @jest-environment jsdom
 */
import { waitFor } from '@testing-library/react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { useSiteSpec } from '../use-site-spec';
import type { SiteSpecConfig } from '../utils';

jest.mock( '@automattic/agents-manager/src/auth/calypso-auth-provider', () => {
	const provider = jest.fn();
	return {
		createCalypsoAuthProvider: jest.fn( () => provider ),
		mockAuthProvider: provider,
	};
} );

jest.mock( '../script-loader', () => ( {
	loadSiteSpecScriptAndCSS: jest.fn( () => Promise.resolve() ),
	resetSiteSpecScriptState: jest.fn(),
} ) );

jest.mock( '../utils', () => ( {
	...jest.requireActual( '../utils' ),
	isSiteSpecEnabled: jest.fn( () => true ),
} ) );

jest.mock( '@automattic/i18n-utils', () => ( {
	useLocale: () => 'en',
} ) );

const { createCalypsoAuthProvider, mockAuthProvider } = jest.requireMock(
	'@automattic/agents-manager/src/auth/calypso-auth-provider'
);

function TestComponent( { siteSpecConfig }: { siteSpecConfig?: SiteSpecConfig } ) {
	useSiteSpec( { container: '#site-spec', siteSpecConfig } );
	return <div id="site-spec" />;
}

const LOGGED_IN_STATE = { currentUser: { id: 123 } };
const LOGGED_OUT_STATE = { currentUser: { id: null } };

describe( 'useSiteSpec', () => {
	beforeEach( () => {
		window.SiteSpec = { init: jest.fn() };
		createCalypsoAuthProvider.mockClear();
	} );

	afterEach( () => {
		delete window.SiteSpec;
	} );

	it( 'passes the Calypso auth provider to the widget', async () => {
		renderWithProvider( <TestComponent />, { initialState: LOGGED_IN_STATE } );

		await waitFor( () =>
			expect( window.SiteSpec?.init ).toHaveBeenCalledWith(
				expect.objectContaining( { authProvider: mockAuthProvider } )
			)
		);
	} );

	it( 'reports JWT failures for a logged-in user', async () => {
		renderWithProvider( <TestComponent />, { initialState: LOGGED_IN_STATE } );

		await waitFor( () => expect( window.SiteSpec?.init ).toHaveBeenCalled() );
		expect( createCalypsoAuthProvider ).toHaveBeenCalledWith( undefined, {
			logWpcomJwtFailure: true,
		} );
	} );

	it( 'keeps JWT failures quiet for a logged-out visitor', async () => {
		// The flow is a signup flow with builtin auth, so logged-out is the
		// expected initial state and a token miss there is noise, not a bug.
		renderWithProvider( <TestComponent />, { initialState: LOGGED_OUT_STATE } );

		await waitFor( () => expect( window.SiteSpec?.init ).toHaveBeenCalled() );
		expect( createCalypsoAuthProvider ).toHaveBeenCalledWith( undefined, {
			logWpcomJwtFailure: false,
		} );
	} );

	it( 'lets a config-provided auth provider override the default', async () => {
		const customAuthProvider = jest.fn();
		renderWithProvider( <TestComponent siteSpecConfig={ { authProvider: customAuthProvider } } />, {
			initialState: LOGGED_IN_STATE,
		} );

		await waitFor( () =>
			expect( window.SiteSpec?.init ).toHaveBeenCalledWith(
				expect.objectContaining( { authProvider: customAuthProvider } )
			)
		);
	} );
} );
