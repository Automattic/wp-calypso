/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getCustomizerFocus } from '../panels';

describe( 'panels', () => {
	describe( 'getCustomizerFocus()', () => {
		test( 'should return null if passed a falsey value', () => {
			const arg = getCustomizerFocus();

			expect( arg ).to.be.null;
		} );

		test( 'should return null if panel is not recognized', () => {
			const arg = getCustomizerFocus( '__UNKNOWN' );

			expect( arg ).to.be.null;
		} );

		test( 'should return object of recognized wordpress focus argument', () => {
			const arg = getCustomizerFocus( 'identity' );

			expect( arg ).to.eql( { 'autofocus[section]': 'title_tagline' } );
		} );
	} );
} );
