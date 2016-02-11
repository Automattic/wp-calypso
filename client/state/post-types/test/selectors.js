/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isRequestingPostTypes,
	getPostTypes
} from '../selectors';

describe( 'selectors', () => {
	describe( '#isRequestingPostTypes()', () => {
		it( 'should return false if the site is not tracked', () => {
			const isRequesting = isRequestingPostTypes( {
				postTypes: {
					requesting: {}
				}
			}, 2916284 );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return false if the site is not fetching', () => {
			const isRequesting = isRequestingPostTypes( {
				postTypes: {
					requesting: {
						2916284: false
					}
				}
			}, 2916284 );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true if the site is fetching', () => {
			const isRequesting = isRequestingPostTypes( {
				postTypes: {
					requesting: {
						2916284: true
					}
				}
			}, 2916284 );

			expect( isRequesting ).to.be.true;
		} );
	} );

	describe( '#getPostTypes()', () => {
		it( 'should return null if the site is not tracked', () => {
			const postTypes = getPostTypes( {
				postTypes: {
					items: {}
				}
			}, 2916284 );

			expect( postTypes ).to.be.null;
		} );

		it( 'should return the post types for a site', () => {
			const postTypes = getPostTypes( {
				postTypes: {
					items: {
						2916284: {
							post: { name: 'post', label: 'Posts' }
						}
					}
				}
			}, 2916284 );

			expect( postTypes ).to.eql( {
				post: { name: 'post', label: 'Posts' }
			} )
		} );
	} );
} );
