/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isValidThemeFilterTerm } from 'calypso/state/themes/selectors';
import { state } from './fixtures/theme-filters';

describe( 'isValidThemeFilterTerm()', () => {
	test( 'should return true for a valid term string', () => {
		expect( isValidThemeFilterTerm( state, 'music' ) ).to.be.true;
		expect( isValidThemeFilterTerm( state, 'feature:video' ) ).to.be.true;
	} );

	test( 'should return false for an invalid filter string', () => {
		expect( isValidThemeFilterTerm( state, 'video' ) ).to.be.false;
		expect( isValidThemeFilterTerm( state, '' ) ).to.be.false;
		expect( isValidThemeFilterTerm( state, ':video' ) ).to.be.false;
		expect( isValidThemeFilterTerm( state, ':' ) ).to.be.false;
	} );
} );
