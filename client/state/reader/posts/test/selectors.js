/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getPost,
	getPostBySiteAndId
} from '../selectors';

describe( 'selectors', () => {
	describe( '#getPost()', () => {
		it( 'should return undefined if there is no match', () => {
			const post = getPost( {
				reader: {
					posts: {
						items: {}
					}
				}
			}, 'nope' );

			expect( post ).to.eql( undefined );
		} );

		it( 'should return a post object if found', () => {
			expect( getPost( {
				reader: {
					posts: {
						items: {
							1234: {
								ID: 1,
								global_ID: '1234'
							}
						}
					}
				}
			}, '1234' ) ).to.deep.equal( {
				ID: 1,
				global_ID: '1234'
			} );
		} );
	} );

	describe( '#getPostBySiteAndId', () => {
		it( 'should return undefined if no matches are found', () => {
			expect( getPostBySiteAndId( {
				reader: {
					posts: {
						items: {
							1: {
								global_ID: '1',
								is_external: true
							},
							2: {
								global_ID: '2',
								ID: 1,
								site_ID: 2
							}
						}
					}
				}
			}, 1, 1 ) ).to.be.undefined;
		} );

		it( 'should return a post if a match is found', () => {
			const stateTree = {
				reader: {
					posts: {
						items: {
							1: {
								global_ID: '1',
								is_external: true
							},
							2: {
								global_ID: '2',
								ID: 1,
								site_ID: 1
							}
						}
					}
				}
			};
			expect( getPostBySiteAndId( stateTree, 1, 1 ) )
				.to.equal( stateTree.reader.posts.items['2'] );
		} );
	} );
} );
