/**
 * Internal dependencies
 */
import { Facebook, Twitter } from '../src';

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
