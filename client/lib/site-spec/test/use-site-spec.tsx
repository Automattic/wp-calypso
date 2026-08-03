/**
 * @jest-environment jsdom
 */
import { render, waitFor } from '@testing-library/react';
import { useSiteSpec } from '../use-site-spec';
import type { SiteSpecConfig } from '../utils';

jest.mock( '@automattic/agents-manager/src/auth/calypso-auth-provider', () => ( {
	createCalypsoAuthProvider: jest.fn( () => jest.fn() ),
} ) );

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

const { createCalypsoAuthProvider } = jest.requireMock(
	'@automattic/agents-manager/src/auth/calypso-auth-provider'
);

function TestComponent( {
	container,
	siteSpecConfig,
}: {
	container: string;
	siteSpecConfig?: SiteSpecConfig;
} ) {
	useSiteSpec( { container: `#${ container }`, siteSpecConfig } );
	return <div id={ container } />;
}

describe( 'useSiteSpec', () => {
	beforeEach( () => {
		window.SiteSpec = { init: jest.fn() };
	} );

	afterEach( () => {
		delete window.SiteSpec;
	} );

	it( 'passes the Calypso auth provider to the widget', async () => {
		render( <TestComponent container="site-spec-auth-default" /> );

		await waitFor( () => expect( window.SiteSpec?.init ).toHaveBeenCalled() );

		expect( window.SiteSpec?.init ).toHaveBeenCalledWith(
			expect.objectContaining( {
				authProvider: createCalypsoAuthProvider.mock.results[ 0 ].value,
			} )
		);
	} );

	it( 'lets a config-provided auth provider override the default', async () => {
		const customAuthProvider = jest.fn();
		render(
			<TestComponent
				container="site-spec-auth-custom"
				siteSpecConfig={ { authProvider: customAuthProvider } }
			/>
		);

		await waitFor( () => expect( window.SiteSpec?.init ).toHaveBeenCalled() );

		expect( window.SiteSpec?.init ).toHaveBeenCalledWith(
			expect.objectContaining( { authProvider: customAuthProvider } )
		);
	} );
} );
