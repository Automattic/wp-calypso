/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getThemeFilterTermFromString } from 'calypso/state/themes/selectors';
import { state } from './fixtures/theme-filters';

describe( 'getThemeFilterTermFromString()', () => {
	test( 'should drop taxonomy prefix from unambiguous filter term', () => {
		const term = getThemeFilterTermFromString( state, 'subject:business' );
		expect( term ).to.equal( 'business' );
	} );

	test( 'should retain taxonomy prefix for ambiguous filter term', () => {
		const term = getThemeFilterTermFromString( state, 'subject:video' );
		expect( term ).to.equal( 'subject:video' );
	} );
} );
