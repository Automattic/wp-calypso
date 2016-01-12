/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getPost, getSitePost } from '../selectors';

describe( 'selectors', () => {
	describe( '#getPost()', () => {
		it( 'should return the object for the post global ID', () => {
			const post = getPost( {
				posts: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
					}
				}
			}, '3d097cb7c5473c169bba0eb8e3c6cb64' );

			expect( post ).to.eql( { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' } );
		} );
	} );

	describe( '#getSitePost()', () => {
		it( 'should return null if the site has not received any posts', () => {
			const post = getSitePost( {
				posts: {
					sitePosts: {}
				}
			}, 2916284, 841 );

			expect( post ).to.be.null;
		} );

		it( 'should return null if the post is not known for the site', () => {
			const post = getSitePost( {
				posts: {
					sitePosts: {
						2916284: {}
					}
				}
			}, 2916284, 841 );

			expect( post ).to.be.null;
		} );

		it( 'should return the object for the post site ID, post ID pair', () => {
			const post = getSitePost( {
				posts: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
					},
					sitePosts: {
						2916284: {
							841: '3d097cb7c5473c169bba0eb8e3c6cb64'
						}
					}
				}
			}, 2916284, 841 );

			expect( post ).to.eql( { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' } );
		} );
	} );
} );
