/**
 * @jest-environment jsdom
 */

import { parseSiteIdParam } from '../agency';

describe( 'parseSiteIdParam', () => {
	test( 'parses a positive integer id', () => {
		expect( parseSiteIdParam( '123' ) ).toBe( 123 );
	} );

	test( 'rejects zero, which would leave the screen on skeletons', () => {
		expect( parseSiteIdParam( '0' ) ).toBeNull();
	} );

	test( 'rejects a trailing-garbage id rather than truncating it', () => {
		expect( parseSiteIdParam( '123abc' ) ).toBeNull();
	} );

	test( 'rejects negative and fractional ids', () => {
		expect( parseSiteIdParam( '-1' ) ).toBeNull();
		expect( parseSiteIdParam( '12.5' ) ).toBeNull();
	} );

	test( 'rejects an empty or non-numeric id', () => {
		expect( parseSiteIdParam( '' ) ).toBeNull();
		expect( parseSiteIdParam( 'abc' ) ).toBeNull();
	} );
} );
