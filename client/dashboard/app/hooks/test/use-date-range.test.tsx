/**
 * @jest-environment jsdom
 */

import { getUnixTime } from 'date-fns';
import { getInitialDateRangeFromSearch, parseUnixSecondsParam } from '../use-date-range';

const FROM_SEC = getUnixTime( new Date( Date.UTC( 2024, 9, 27 ) ) );
const TO_SEC = getUnixTime( new Date( Date.UTC( 2024, 9, 29, 23, 59, 59 ) ) );

describe( 'parseUnixSecondsParam', () => {
	test( 'returns seconds unchanged', () => {
		expect( parseUnixSecondsParam( String( FROM_SEC ) ) ).toBe( FROM_SEC );
	} );

	test( 'converts milliseconds to seconds', () => {
		expect( parseUnixSecondsParam( String( FROM_SEC * 1000 ) ) ).toBe( FROM_SEC );
		expect( parseUnixSecondsParam( String( FROM_SEC * 1000 + 999 ) ) ).toBe( FROM_SEC );
	} );

	test.each( [ null, undefined, '', 'abc' ] )( 'returns null for %p', ( raw ) => {
		expect( parseUnixSecondsParam( raw ) ).toBeNull();
	} );
} );

describe( 'getInitialDateRangeFromSearch', () => {
	test( 'parses seconds and milliseconds to the same range', () => {
		const fromSeconds = getInitialDateRangeFromSearch( `?from=${ FROM_SEC }&to=${ TO_SEC }` );
		const fromMs = getInitialDateRangeFromSearch(
			`?from=${ FROM_SEC * 1000 }&to=${ TO_SEC * 1000 }`
		);

		expect( fromSeconds ).toEqual( {
			start: new Date( FROM_SEC * 1000 ),
			end: new Date( TO_SEC * 1000 ),
		} );
		expect( fromMs ).toEqual( fromSeconds );
	} );

	test( 'returns null when a param is missing or invalid', () => {
		expect( getInitialDateRangeFromSearch( `?from=${ FROM_SEC }` ) ).toBeNull();
		expect( getInitialDateRangeFromSearch( `?from=abc&to=${ TO_SEC }` ) ).toBeNull();
	} );

	test( 'returns null when the range is reversed', () => {
		expect( getInitialDateRangeFromSearch( `?from=${ TO_SEC }&to=${ FROM_SEC }` ) ).toBeNull();
	} );
} );
