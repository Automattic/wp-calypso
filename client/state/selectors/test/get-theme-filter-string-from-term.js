/**
 * Internal dependencies
 */
import { getThemeFilterStringFromTerm } from 'calypso/state/themes/selectors';
import { state } from './fixtures/theme-filters';

describe( 'getThemeFilterStringFromTerm', () => {
	test( 'should return taxonomy:term filter given the term', () => {
		expect( getThemeFilterStringFromTerm( state, 'artwork' ) ).toBe( 'subject:artwork' );
		expect( getThemeFilterStringFromTerm( state, 'bright' ) ).toBe( 'style:bright' );
	} );

	test( 'should return empty string given an invalid term', () => {
		expect( getThemeFilterStringFromTerm( state, '' ) ).toBe( '' );
		expect( getThemeFilterStringFromTerm( state, ' ' ) ).toBe( '' );
		expect( getThemeFilterStringFromTerm( state, ' artwork' ) ).toBe( '' );
		expect( getThemeFilterStringFromTerm( state, 'artwork ' ) ).toBe( '' );
		expect( getThemeFilterStringFromTerm( state, 'aartwork' ) ).toBe( '' );
	} );
} );
