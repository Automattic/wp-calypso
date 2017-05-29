/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isAmbiguousThemeFilterTerm } from '../';
import { state } from './fixtures/theme-filters';

describe( 'isAmbiguousThemeFilterTerm()', () => {
	it( 'should return false for an unambiguous term', () => {
		expect( isAmbiguousThemeFilterTerm( state, 'music' ) ).to.be.false;
	} );

	it( 'should return true for an ambiguous term', () => {
		expect( isAmbiguousThemeFilterTerm( state, 'video' ) ).to.be.true;
	} );
} );
