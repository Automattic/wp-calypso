/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { prependThemeFilterKeys } from 'calypso/state/themes/selectors';
import { state } from './fixtures/theme-filters';

describe( 'getThemeFilterStringFromTerm', () => {
	test( 'should handle invalid input', () => {
		expect( prependThemeFilterKeys( state, '' ) ).to.equal( '' );
		expect( prependThemeFilterKeys( state, '     ' ) ).to.equal( '' );
		expect( prependThemeFilterKeys( state, ' tsr tsr .' ) ).to.equal( '' );
	} );

	test( 'should prepend keys for valid terms and leave a trailing space', () => {
		const result = prependThemeFilterKeys( state, 'business subject:video blog clean' );
		expect( result ).to.equal( 'subject:business subject:video subject:blog style:clean ' );
	} );
} );
