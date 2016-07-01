/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { SEO_TITLE_SET } from 'state/action-types';

import { titleFormats } from '../reducer';

const siteA = 1;
const siteB = 2;

const siteNameTagline = '%site_name% | %tagline%';
const postTitleSiteName = '%post_title% | %site_name%';

describe( 'reducer', () => {
	describe( '#titleFormats()', () => {
		const prev = {
			[ siteA ]: {
				frontPage: siteNameTagline
			}
		};

		it( 'should return empty structure when initializing', () => {
			expect( titleFormats( undefined, {} ) ).to.eql( {} );
		} );

		it( 'should add new formats to an empty structure', () => {
			expect( titleFormats( undefined, {
				type: SEO_TITLE_SET,
				siteId: siteA,
				pageType: 'frontPage',
				format: siteNameTagline
			} ) ).to.eql( {
				[ siteA ]: {
					frontPage: siteNameTagline
				}
			} )
		} );

		it( 'should add new formats to an existing structure', () => {
			expect( titleFormats( prev, {
				type: SEO_TITLE_SET,
				siteId: siteA,
				pageType: 'pages',
				format: postTitleSiteName
			} ) ).to.eql( {
				[ siteA ]: {
					frontPage: siteNameTagline,
					pages: postTitleSiteName
				}
			} );
		} );

		it( 'should overwrite existing format', () => {
			expect( titleFormats( prev, {
				type: SEO_TITLE_SET,
				siteId: siteA,
				pageType: 'frontPage',
				format: postTitleSiteName
			} ) ).to.eql( {
				[ siteA ]: {
					frontPage: postTitleSiteName
				}
			} );
		} );

		it( 'should add formats in a different site', () => {
			expect( titleFormats( prev, {
				type: SEO_TITLE_SET,
				siteId: siteB,
				pageType: 'frontPage',
				format: siteNameTagline
			} ) ).to.eql( {
				[ siteA ]: {
					frontPage: siteNameTagline
				},
				[ siteB ]: {
					frontPage: siteNameTagline
				}
			} );
		} );
	} );
} );
