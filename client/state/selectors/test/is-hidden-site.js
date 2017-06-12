/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isHiddenSite } from '../';

describe( 'isHiddenSite()', () => {
	it( 'should return null if the site is not known', () => {
		const isHidden = isHiddenSite( {
			siteSettings: {
				items: {
					2916284: {
						blog_public: 1
					}
				}
			}
		}, 2916285 );

		expect( isHidden ).to.be.null;
	} );

	it( 'should return false for public sites', () => {
		const isHidden = isHiddenSite( {
			siteSettings: {
				items: {
					2916284: {
						blog_public: 1
					}
				}
			}
		}, 2916284 );

		expect( isHidden ).to.be.false;
	} );

	it( 'should return true for hidden sites', () => {
		const isHidden = isHiddenSite( {
			siteSettings: {
				items: {
					2916284: {
						blog_public: 0
					}
				}
			}
		}, 2916284 );

		expect( isHidden ).to.be.true;
	} );
} );
