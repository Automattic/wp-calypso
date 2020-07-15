/**
 * Internal dependencies
 */
import { Facebook, Twitter, Reader } from '../src';

describe( 'Facebook previews', () => {
	it( 'should expose a Facebook preview component', () => {
		expect( Facebook ).not.toBe( undefined );
	} );
} );

describe( 'Twitter previews', () => {
	it( 'should expose a Twitter preview component', () => {
		expect( Twitter ).not.toBe( undefined );
	} );
} );

/* eslint-disable jest/no-disabled-tests */
describe.skip( 'Reader previews', () => {
	it( 'should expose a Reader preview component', () => {
		expect( Reader ).not.toBe( undefined );
	} );
} );
/* eslint-enable jest/no-disabled-tests */
