/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isValidThemeFilterTerm } from '../';
import { state } from './fixtures/theme-filters';

describe( 'isValidThemeFilterTerm()', () => {
	it( 'should return true for a valid term string', () => {
		expect( isValidThemeFilterTerm( state, 'music' ) ).to.be.true;
		expect( isValidThemeFilterTerm( state, 'feature:video' ) ).to.be.true;
	} );

	it( 'should return false for an invalid filter string', () => {
		expect( isValidThemeFilterTerm( state, 'video' ) ).to.be.false;
		expect( isValidThemeFilterTerm( state, '' ) ).to.be.false;
		expect( isValidThemeFilterTerm( state, ':video' ) ).to.be.false;
		expect( isValidThemeFilterTerm( state, ':' ) ).to.be.false;
	} );
} );
