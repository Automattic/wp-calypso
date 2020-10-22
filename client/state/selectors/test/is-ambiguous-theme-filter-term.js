/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isAmbiguousThemeFilterTerm } from 'calypso/state/themes/selectors';
import { state } from './fixtures/theme-filters';

describe( 'isAmbiguousThemeFilterTerm()', () => {
	test( 'should return false for an unambiguous term', () => {
		expect( isAmbiguousThemeFilterTerm( state, 'music' ) ).to.be.false;
	} );

	test( 'should return true for an ambiguous term', () => {
		expect( isAmbiguousThemeFilterTerm( state, 'video' ) ).to.be.true;
	} );
} );
