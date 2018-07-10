/**
 * External dependencies
 */
import isPlainObj from 'is-plain-obj';

/**
 * Internal dependencies
 */
import config from '../';

describe( 'npm-package-json-lint config tests', () => {
	it( 'should be an object', () => {
		expect( isPlainObj( config ) ).toBeTruthy();
	} );

	it( 'should have rules property as an object', () => {
		expect( isPlainObj( config.rules ) ).toBeTruthy();
	} );
} );
