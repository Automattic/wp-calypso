/**
 * External Dependencies
 */
import { expect } from 'chai';

/**
 * Internal Dependencies
 */

import { shouldFetchRelated, relatedPostsForPost } from '../selectors';

describe( 'selectors', () => {
	describe( 'shouldFetchRelated', () => {
		it( 'should return true if no key present', () => {
			expect( shouldFetchRelated( {
				reader: {
					relatedPosts: {
						queuedRequests: {

						}
					}
				}
			}, 1, 1 ) ).to.be.true;
		} );
		it( 'should return false if key present', () => {
			expect( shouldFetchRelated( {
				reader: {
					relatedPosts: {
						queuedRequests: {
							'1-1': true
						}
					}
				}
			}, 1, 1 ) ).to.be.false;
		} );
	} );

	describe( 'relatedPostsForPost', () => {
		it( 'should return the posts that are there', () => {
			expect( relatedPostsForPost( {
				reader: {
					relatedPosts: {
						items: {
							'1-1': [ 1, 2 ]
						}
					}
				}
			}, 1, 1 ) ).to.eql( [ 1, 2 ] );
		} );

		it( 'should return undefined if nothing present', () => {
			expect( relatedPostsForPost( {
				reader: {
					relatedPosts: {
						items: {
							'1-2': [ 1, 2 ]
						}
					}
				}
			}, 1, 1 ) ).to.be.undefined;
		} );
	} );
} );
