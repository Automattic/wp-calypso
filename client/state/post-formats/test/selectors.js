/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isRequestingPostFormats, getPostFormats } from '../selectors';

describe( 'selectors', () => {
	describe( '#isRequestingPostFormats()', () => {
		it( 'should return false if the site has never been fetched', () => {
			const isRequesting = isRequestingPostFormats( {
				postFormats: {
					requesting: {}
				}
			}, 12345678 );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return false if the site is not fetching', () => {
			const isRequesting = isRequestingPostFormats( {
				postFormats: {
					requesting: {
						12345678: false
					}
				}
			}, 12345678 );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true if the site is fetching', () => {
			const isRequesting = isRequestingPostFormats( {
				postFormats: {
					requesting: {
						12345678: true
					}
				}
			}, 12345678 );

			expect( isRequesting ).to.be.true;
		} );
	} );

	describe( '#getPostFormats()', () => {
		it( 'should return null if the site has never been fetched', () => {
			const postFormats = getPostFormats( {
				postFormats: {
					items: {}
				}
			}, 12345678 );

			expect( postFormats ).to.be.null;
		} );

		it( 'should return the post formats for a site', () => {
			const postFormats = getPostFormats( {
				postFormats: {
					items: {
						12345678: {
							image: 'Image',
							link: 'Link'
						}
					}
				}
			}, 12345678 );

			expect( postFormats ).to.eql( {
				image: 'Image',
				link: 'Link'
			} );
		} );
	} );
} );
