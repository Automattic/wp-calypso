/**
 * @jest-environment jsdom
 */
import { render, waitFor } from '@testing-library/react';
import { useSiteSpec } from '../use-site-spec';
import type { SiteSpecConfig } from '../utils';

jest.mock( '@automattic/agents-manager/src/auth/calypso-auth-provider', () => {
	const provider = jest.fn();
	return {
		createCalypsoAuthProvider: () => provider,
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

const { mockAuthProvider } = jest.requireMock(
	'@automattic/agents-manager/src/auth/calypso-auth-provider'
);

function TestComponent( { siteSpecConfig }: { siteSpecConfig?: SiteSpecConfig } ) {
	useSiteSpec( { container: '#site-spec', siteSpecConfig } );
	return <div id="site-spec" />;
}

describe( 'useSiteSpec', () => {
	beforeEach( () => {
		window.SiteSpec = { init: jest.fn() };
	} );

	afterEach( () => {
		delete window.SiteSpec;
	} );

	it( 'passes the Calypso auth provider to the widget', async () => {
		render( <TestComponent /> );

		await waitFor( () =>
			expect( window.SiteSpec?.init ).toHaveBeenCalledWith(
				expect.objectContaining( { authProvider: mockAuthProvider } )
			)
		);
	} );

	it( 'lets a config-provided auth provider override the default', async () => {
		const customAuthProvider = jest.fn();
		render( <TestComponent siteSpecConfig={ { authProvider: customAuthProvider } } /> );

		await waitFor( () =>
			expect( window.SiteSpec?.init ).toHaveBeenCalledWith(
				expect.objectContaining( { authProvider: customAuthProvider } )
			)
		);
	} );
} );
