/** @format */

/**
 * External dependencies
 */
import { getThemeFilterStringFromTerm } from '../';
import { state } from './fixtures/theme-filters';

describe( 'getThemeFilterStringFromTerm', () => {
	test( 'should return taxonomy:term filter given the term', () => {
		expect( getThemeFilterStringFromTerm( state, 'artwork' ) ).toEqual( 'subject:artwork' );
		expect( getThemeFilterStringFromTerm( state, 'bright' ) ).toEqual( 'style:bright' );
	} );

	test( 'should return empty string given an invalid term', () => {
		expect( getThemeFilterStringFromTerm( state, '' ) ).toEqual( '' );
		expect( getThemeFilterStringFromTerm( state, ' ' ) ).toEqual( '' );
		expect( getThemeFilterStringFromTerm( state, ' artwork' ) ).toEqual( '' );
		expect( getThemeFilterStringFromTerm( state, 'artwork ' ) ).toEqual( '' );
		expect( getThemeFilterStringFromTerm( state, 'aartwork' ) ).toEqual( '' );
	} );
} );
