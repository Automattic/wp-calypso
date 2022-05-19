import { getCustomizerFocus } from '../panels';

describe( 'panels', () => {
	describe( 'getCustomizerFocus()', () => {
		test( 'should return null if passed a falsey value', () => {
			const arg = getCustomizerFocus();

			expect( arg ).toBeNull();
		} );

		test( 'should return null if panel is not recognized', () => {
			const arg = getCustomizerFocus( '__UNKNOWN' );

			expect( arg ).toBeNull();
		} );

		test( 'should return object of recognized wordpress focus argument', () => {
			const arg = getCustomizerFocus( 'identity' );

			expect( arg ).toEqual( { 'autofocus[section]': 'title_tagline' } );
		} );
	} );
} );
