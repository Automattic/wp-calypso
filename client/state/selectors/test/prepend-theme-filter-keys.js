/**
 * External dependencies
 */
import { assert, expect } from 'chai';

/**
 * Internal dependencies
 */
import { prependThemeFilterKeys } from '../';
import { state } from './fixtures/theme-filters';

describe( 'getThemeFilterStringFromTerm', () => {
	it( 'should handle invalid input', () => {
		assert.equal( prependThemeFilterKeys( state, '' ), '' );
		assert.equal( prependThemeFilterKeys( state, '     ' ), '' );
		assert.equal( prependThemeFilterKeys( state, ' tsr tsr .' ), '' );
	} );

	it( 'should prepend keys for valid terms and leave a trailing space', () => {
		const result = prependThemeFilterKeys( state, 'business subject:video blog clean' );
		expect( result ).to.equal( 'subject:business subject:video subject:blog style:clean ' );
	} );
} );
