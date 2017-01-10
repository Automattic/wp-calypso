/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { countPostLikes } from '../';

describe( 'countPostLikes()', () => {
	it( 'should return null if the site has never been fetched', () => {
		const count = countPostLikes( {
			posts: {
				likes: {
					items: {}
				}
			}
		}, 12345678, 50 );

		expect( count ).to.be.null;
	} );

	it( 'should return null if the post has never been fetched', () => {
		const count = countPostLikes( {
			posts: {
				likes: {
					items: {
						12345678: {
							10: { found: 42 }
						}
					}
				}
			}
		}, 12345678, 50 );

		expect( count ).to.be.null;
	} );

	it( 'should return the total of post likes', () => {
		const count = countPostLikes( {
			posts: {
				likes: {
					items: {
						12345678: {
							50: { found: 42 }
						}
					}
				}
			}
		}, 12345678, 50 );

		expect( count ).to.eql( 42 );
	} );
} );
