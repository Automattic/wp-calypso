/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getThemeShowcaseDescription } from 'calypso/state/themes/selectors';
import { state } from './fixtures/theme-filters';

describe( 'getThemeShowcaseDescription()', () => {
	test( 'should return the vertical description for a known vertical', () => {
		const description = getThemeShowcaseDescription( state, { vertical: 'blog' } );
		expect( description ).to.equal(
			"Whether you're authoring a personal blog, professional blog, or a business blog — ..."
		);
	} );

	test( 'should return the filter description for a known filter', () => {
		const description = getThemeShowcaseDescription( state, { filter: 'minimal' } );
		expect( description ).to.equal(
			"Whether you're minimalist at heart, like keeping things clean, or just want to focus — ..."
		);
	} );

	test( 'should fall back to generic vertical description for an unknown vertical', () => {
		const description = getThemeShowcaseDescription( state, { vertical: 'blahg', tier: 'free' } );
		expect( description ).to.equal(
			'Discover blahg WordPress Themes on the WordPress.com Showcase. ' +
				'Here you can browse and find the best WordPress designs available on ' +
				'WordPress.com to discover the one that is just right for you.'
		);
	} );

	test( 'should return the generic Theme Showcase description if no additional args are provided', () => {
		const description = getThemeShowcaseDescription( state );
		expect( description ).to.equal(
			'Beautiful, responsive, free and premium WordPress themes ' +
				'for your photography site, portfolio, magazine, business website, or blog.'
		);
	} );
} );
