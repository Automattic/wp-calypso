/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getTitleFormats } from '../selectors';

describe( 'selectors', () => {
	describe( '#getTitleFormats', () => {
		const state = { sites: { seo: { titleFormats: {
			1: { frontPage: '%site_name%', pages: '%page_title%' },
			2: { frontPage: 'Great site!' }
		} } } };

		it( 'should return all title formats for a given site', () => {
			expect( getTitleFormats( state, 1 ) ).to.eql( {
				frontPage: '%site_name%',
				pages: '%page_title%'
			} );
		} );
	} );
} );
