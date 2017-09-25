/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getThemeShowcaseTitle } from '../';
import { state } from './fixtures/theme-filters';

describe( 'getThemeShowcaseTitle()', () => {
	it( 'should return the correct title for a known vertical', () => {
		const title = getThemeShowcaseTitle( state, { vertical: 'business' } );
		expect( title ).to.equal( 'Business WordPress Themes' );
	} );

	it( 'should return the correct title for a known filter', () => {
		const title = getThemeShowcaseTitle( state, { filter: 'minimal' } );
		expect( title ).to.equal( 'Minimal WordPress Themes' );
	} );

	it( 'should fall back to tier if multiple filters are specified', () => {
		const title = getThemeShowcaseTitle( state, { filter: 'artwork+blog', tier: 'free' } );
		expect( title ).to.equal( 'Free WordPress Themes' );
	} );

	it( 'should return correct title if only premium tier is specified', () => {
		const title = getThemeShowcaseTitle( state, { tier: 'premium' } );
		expect( title ).to.equal( 'Premium WordPress Themes' );
	} );

	it( 'should return correct title if only free tier is specified', () => {
		const title = getThemeShowcaseTitle( state, { tier: 'free' } );
		expect( title ).to.equal( 'Free WordPress Themes' );
	} );

	it( 'should return the generic Theme Showcase title if no additional args are provided', () => {
		const title = getThemeShowcaseTitle( state );
		expect( title ).to.equal( 'WordPress Themes' );
	} );
} );
