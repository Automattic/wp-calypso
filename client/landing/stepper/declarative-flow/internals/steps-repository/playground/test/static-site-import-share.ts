/**
 * @jest-environment jsdom
 */
import { STATIC_SITE_IMPORT_SHARE_KEY_PREFIX } from '../lib/constants';
import {
	forgetStaticSiteImportShare,
	readStaticSiteImportShare,
	rememberStaticSiteImportShare,
} from '../lib/static-site-import-share';

describe( 'static site import share memory', () => {
	beforeEach( () => {
		localStorage.clear();
		jest.restoreAllMocks();
	} );

	it( 'keeps the token per Playground, across tabs, until it is forgotten', () => {
		rememberStaticSiteImportShare( 'playground-1', 'a.b.c' );
		rememberStaticSiteImportShare( 'playground-2', 'd.e.f' );

		expect( localStorage.getItem( STATIC_SITE_IMPORT_SHARE_KEY_PREFIX + 'playground-1' ) ).toBe(
			'a.b.c'
		);
		expect( readStaticSiteImportShare( 'playground-1' ) ).toBe( 'a.b.c' );
		forgetStaticSiteImportShare( 'playground-1' );
		expect( readStaticSiteImportShare( 'playground-1' ) ).toBeUndefined();
		expect( readStaticSiteImportShare( 'playground-2' ) ).toBe( 'd.e.f' );
	} );

	it( 'forgets the token when the Playground is booted from something else', () => {
		rememberStaticSiteImportShare( 'playground-1', 'a.b.c' );
		rememberStaticSiteImportShare( 'playground-1', null );

		expect( readStaticSiteImportShare( 'playground-1' ) ).toBeUndefined();
	} );

	it( 'never throws when storage is unavailable', () => {
		jest.spyOn( Storage.prototype, 'setItem' ).mockImplementation( () => {
			throw new Error( 'QuotaExceededError' );
		} );
		jest.spyOn( Storage.prototype, 'getItem' ).mockImplementation( () => {
			throw new Error( 'SecurityError' );
		} );

		expect( () => rememberStaticSiteImportShare( 'playground-1', 'a.b.c' ) ).not.toThrow();
		expect( readStaticSiteImportShare( 'playground-1' ) ).toBeUndefined();
	} );
} );
