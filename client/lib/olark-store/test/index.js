/** @format */

/**
 * External dependencies
 */
import olarkStore from 'lib/olark-store';

describe( 'index', () => {
	test( 'Olark store data should be an object', () => {
		const data = olarkStore.get();
		expect( typeof data ).toBe( 'object' );
	} );

	test( 'Olark store data should have expected properties', () => {
		const data = olarkStore.get();
		expect( typeof data.isOlarkReady ).toBe( 'boolean' );
		expect( typeof data.isOperatorAvailable ).toBe( 'boolean' );
		expect( typeof data.details ).toBe( 'object' );
	} );
} );
