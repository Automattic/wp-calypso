/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isRequestingPostLikes } from '../';

describe( 'isRequestingPostLikes()', () => {
	it( 'should return false if the site has never been fetched', () => {
		const isRequesting = isRequestingPostLikes( {
			posts: {
				likes: {
					requesting: {}
				}
			}
		}, 12345678, 50 );

		expect( isRequesting ).to.be.false;
	} );

	it( 'should return false if the post has never been fetched', () => {
		const isRequesting = isRequestingPostLikes( {
			posts: {
				likes: {
					requesting: {
						12345678: {
							10: true
						}
					}
				}
			}
		}, 12345678, 50 );

		expect( isRequesting ).to.be.false;
	} );

	it( 'should return false if the post is not fetching', () => {
		const isRequesting = isRequestingPostLikes( {
			posts: {
				likes: {
					requesting: {
						12345678: {
							50: false
						}
					}
				}
			}
		}, 12345678, 50 );

		expect( isRequesting ).to.be.false;
	} );

	it( 'should return true if the post is fetching', () => {
		const isRequesting = isRequestingPostLikes( {
			posts: {
				likes: {
					requesting: {
						12345678: {
							50: true
						}
					}
				}
			}
		}, 12345678, 50 );

		expect( isRequesting ).to.be.true;
	} );
} );
