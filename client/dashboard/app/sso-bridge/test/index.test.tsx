/**
 * @jest-environment jsdom
 */

import { waitFor } from '@testing-library/react';
import { render } from '../../../test-utils';
import SsoBridge from '../index';

const mockSsoAuthorize = jest.fn();

let mockSearchParams: Record< string, string | undefined > = {};

jest.mock( '@automattic/calypso-config', () => {
	const config = () => '';
	config.isEnabled = () => false;
	return config;
} );

jest.mock( '@automattic/api-core', () => ( {
	ssoAuthorize: ( ...args: unknown[] ) => mockSsoAuthorize( ...args ),
} ) );

jest.mock( '@tanstack/react-router', () => ( {
	...jest.requireActual( '@tanstack/react-router' ),
	useSearch: ( { from }: { from: string } ) => {
		if ( from === '/sso-bridge' ) {
			return mockSearchParams;
		}
		return {};
	},
} ) );

describe( '<SsoBridge>', () => {
	let originalLocationReplace: typeof window.location.replace;

	beforeEach( () => {
		jest.clearAllMocks();
		originalLocationReplace = window.location.replace;
		Object.defineProperty( window, 'location', {
			writable: true,
			value: { ...window.location, replace: jest.fn() },
		} );
	} );

	afterEach( () => {
		Object.defineProperty( window, 'location', {
			writable: true,
			value: { ...window.location, replace: originalLocationReplace },
		} );
	} );

	test( 'renders loading skeleton while authorizing', () => {
		mockSearchParams = { site_id: '123', sso_nonce: 'abc' };
		mockSsoAuthorize.mockReturnValue( new Promise( () => {} ) );

		render( <SsoBridge /> );

		expect( document.querySelector( '.components-v-stack' ) ).toBeVisible();
	} );

	test( 'calls ssoAuthorize and redirects on success', async () => {
		mockSearchParams = { site_id: '123', sso_nonce: 'abc' };
		mockSsoAuthorize.mockResolvedValue( { sso_url: 'https://example.com/wp-admin' } );

		render( <SsoBridge /> );

		await waitFor( () => {
			expect( mockSsoAuthorize ).toHaveBeenCalledWith( 123, 'abc' );
		} );

		await waitFor( () => {
			expect( window.location.replace ).toHaveBeenCalledWith( 'https://example.com/wp-admin' );
		} );
	} );

	test( 'does not call ssoAuthorize when params are missing', () => {
		mockSearchParams = {};

		render( <SsoBridge /> );

		expect( mockSsoAuthorize ).not.toHaveBeenCalled();
	} );
} );
