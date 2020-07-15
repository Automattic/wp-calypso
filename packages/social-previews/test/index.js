/**
 * Internal dependencies
 */
import { Facebook } from '../src';

describe( 'Facebook preview', () => {
	it( 'should expose a Facebook preview component', () => {
		expect( Facebook ).not.toBe( undefined );
	} );
} );
