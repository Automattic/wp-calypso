/* eslint-disable no-shadow -- shadowing localizePath makes tests readable */

import { renderHook } from '@testing-library/react-hooks';
import { localizePath, useLocalizePath } from '../';

jest.mock( '../locale-context', () => {
	const original = jest.requireActual( '../locale-context' );
	return Object.assign( Object.create( Object.getPrototypeOf( original ) ), original, {
		useLocale: jest.fn( () => 'en' ),
	} );
} );

jest.mock( '@automattic/calypso-config', () => ( {
	// Useful because the getAvailableDesigns function uses feature flags for
	// arguments default values
	isEnabled: () => false,
} ) );

const { useLocale } = jest.requireMock( '../locale-context' );

describe( '#localizePath', () => {
	function testLocalizePath( locale = 'en' ) {
		// Replace the locale given by `useLocale()` with the mocked locale, return a new versio nof localizePath
		useLocale.mockImplementation( () => locale );
		const {
			result: { current: localizePath },
		} = renderHook( () => useLocalizePath() ); // eslint-disable-line react-hooks/rules-of-hooks -- being called within renderHook context
		return localizePath;
	}

	test( 'should use useLocale for current provider locale as the switch to locale when none is specified', () => {
		let localizePath;

		localizePath = testLocalizePath( 'pt-br' );
		expect( localizePath( 0, undefined, false ) ).toEqual( 0 );
		expect( localizePath( undefined, undefined, false ) ).toEqual( undefined );
		expect( localizePath( '', undefined, false ) ).toEqual( '' );
		expect( localizePath( 'forums/', undefined, false ) ).toEqual( 'forums/' );
		expect( localizePath( '/forums/', undefined, false ) ).toEqual( '/pt-br/forums/' );
		expect( localizePath( '/pt-br/forums/', undefined, false ) ).toEqual( '/pt-br/forums/' );
		localizePath = testLocalizePath( 'en' );
		expect( localizePath( '/forums/' ) ).toEqual( '/forums/' );
	} );

	test( 'themes', () => {
		expect( localizePath( '/themes/', 'en', true ) ).toEqual( '/themes/' );
		expect( localizePath( '/themes/', 'de', true ) ).toEqual( '/themes/' );
		expect( localizePath( '/themes/', 'pl', true ) ).toEqual( '/themes/' );
		expect( localizePath( '/themes/', 'en', false ) ).toEqual( '/themes/' );
		expect( localizePath( '/themes/', 'de', false ) ).toEqual( '/de/themes/' );

		expect( localizePath( '/details/', 'de', true ) ).toEqual( '/details/' );
		expect( localizePath( '/details/', 'de', false ) ).toEqual( '/de/details/' );

		expect( localizePath( '/pl/themes/', 'pl', false ) ).toEqual( '/pl/themes/' );
		expect( localizePath( '/pl/themes/', 'pl', true ) ).toEqual( '/pl/themes/' );
		expect( localizePath( '/themes/free/', 'de', true ) ).toEqual( '/themes/free/' );
		expect( localizePath( '/themes/free/', 'de', false ) ).toEqual( '/de/themes/free/' );
		expect( localizePath( '/themes/free/filter/example-filter/', 'de', true ) ).toEqual(
			'/themes/free/filter/example-filter/'
		);
		expect( localizePath( '/themes/free/filter/example-filter/', 'de', false ) ).toEqual(
			'/de/themes/free/filter/example-filter/'
		);
	} );
} );
