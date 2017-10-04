/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getThemeFilterTermFromString } from '../';
import { state } from './fixtures/theme-filters';

describe( 'getThemeFilterTermFromString()', () => {
	it( 'should drop taxonomy prefix from unambiguous filter term', () => {
		const term = getThemeFilterTermFromString( state, 'subject:business' );
		expect( term ).to.equal( 'business' );
	} );

	it( 'should retain taxonomy prefix for ambiguous filter term', () => {
		const term = getThemeFilterTermFromString( state, 'subject:video' );
		expect( term ).to.equal( 'subject:video' );
	} );
} );
