/**
 * @vitest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { type Mock, vi } from 'vitest';
import { sanitizeDirectToCartRedirect } from '../sanitize-redirect';

vi.mock( 'calypso/my-sites/checkout/get-thank-you-page-url', () =>
	( ( m ) => ( { ...m, default: m } ) )( {
		getAllowedExternalRedirectHosts: () => [ 'allowed.example', 'my.wordpress.com' ],
	} )
);

vi.mock( '@automattic/calypso-config', async () => {
	const actualConfigFn = await vi.importActual< typeof import( '@automattic/calypso-config' ) >(
		'@automattic/calypso-config'
	);
	const configFn = vi.fn( ( key ) => actualConfigFn( key ) );
	Object.assign( configFn, actualConfigFn );
	return { ...configFn, default: configFn };
} );

describe( 'sanitizeDirectToCartRedirect', () => {
	const mockedConfig = config as unknown as Mock;

	beforeEach( () => {
		mockedConfig.mockImplementation( ( key: string ) => {
			if ( key === 'env_id' ) {
				return 'production';
			}
			return undefined;
		} );
	} );

	afterEach( () => {
		mockedConfig.mockReset();
	} );

	it( 'returns the URL when hostname is in the allowlist over https', () => {
		expect( sanitizeDirectToCartRedirect( 'https://allowed.example/path?q=1' ) ).toBe(
			'https://allowed.example/path?q=1'
		);
	} );

	it( 'rejects http (non-localhost) outside development', () => {
		expect( sanitizeDirectToCartRedirect( 'http://allowed.example/path' ) ).toBeNull();
	} );

	it( 'rejects substring-similar hostnames (exact match required)', () => {
		expect( sanitizeDirectToCartRedirect( 'https://allowed.example.evil.com/x' ) ).toBeNull();
	} );

	it( 'rejects hostname-confusion via fragment / userinfo', () => {
		expect( sanitizeDirectToCartRedirect( 'https://allowed.example#@evil.com' ) ).toBeNull();
	} );

	it( 'rejects javascript: protocol', () => {
		expect( sanitizeDirectToCartRedirect( 'javascript:alert(1)' ) ).toBeNull();
	} );

	it( 'rejects data: protocol', () => {
		expect( sanitizeDirectToCartRedirect( 'data:text/html,<script>alert(1)</script>' ) ).toBeNull();
	} );

	it( 'rejects a malformed URL without throwing', () => {
		expect( () => sanitizeDirectToCartRedirect( '://not-a-url' ) ).not.toThrow();
		expect( sanitizeDirectToCartRedirect( '://not-a-url' ) ).toBeNull();
	} );

	it( 'returns null for empty / null / undefined inputs', () => {
		expect( sanitizeDirectToCartRedirect( '' ) ).toBeNull();
		expect( sanitizeDirectToCartRedirect( null ) ).toBeNull();
		expect( sanitizeDirectToCartRedirect( undefined ) ).toBeNull();
	} );

	it( 'allows http://localhost when env_id is development', () => {
		mockedConfig.mockImplementation( ( key: string ) =>
			key === 'env_id' ? 'development' : undefined
		);
		expect( sanitizeDirectToCartRedirect( 'http://localhost:3001/return' ) ).toBe(
			'http://localhost:3001/return'
		);
	} );

	it( 'allows http://*.localhost when env_id is development', () => {
		mockedConfig.mockImplementation( ( key: string ) =>
			key === 'env_id' ? 'development' : undefined
		);
		expect( sanitizeDirectToCartRedirect( 'http://telex.localhost:3001/x' ) ).toBe(
			'http://telex.localhost:3001/x'
		);
	} );

	it( 'rejects localhost-attacker spoofing even in development', () => {
		mockedConfig.mockImplementation( ( key: string ) =>
			key === 'env_id' ? 'development' : undefined
		);
		expect( sanitizeDirectToCartRedirect( 'http://localhost-attacker.example/x' ) ).toBeNull();
	} );

	it( 'rejects http://localhost outside development', () => {
		expect( sanitizeDirectToCartRedirect( 'http://localhost:3001/return' ) ).toBeNull();
	} );
} );
