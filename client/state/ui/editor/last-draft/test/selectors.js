/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import PostQueryManager from 'lib/query-manager/post';
import {
	getEditorLastDraftPost,
	getEditorLastDraftSiteId,
	getEditorLastDraftPostId
} from '../selectors';

describe( 'selectors', () => {
	describe( '#getEditorLastDraftPost()', () => {
		it( 'should return null if no last draft set', () => {
			const post = getEditorLastDraftPost( {
				posts: {
					queries: {},
					edits: {}
				},
				ui: {
					editor: {
						lastDraft: {
							siteId: null,
							postId: null
						}
					}
				}
			} );

			expect( post ).to.be.null;
		} );

		it( 'should return last draft edited post object', () => {
			const post = getEditorLastDraftPost( {
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
							}
						} )
					},
					edits: {
						2916284: {
							841: {
								type: 'post'
							}
						}
					}
				},
				ui: {
					editor: {
						lastDraft: {
							siteId: 2916284,
							postId: 841
						}
					}
				}
			} );

			expect( post ).to.eql( {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Hello World',
				type: 'post'
			} );
		} );
	} );

	describe( '#getEditorLastDraftSiteId()', () => {
		it( 'should return the last draft site ID state', () => {
			const siteId = getEditorLastDraftSiteId( {
				ui: {
					editor: {
						lastDraft: {
							siteId: 2916284,
							postId: 841
						}
					}
				}
			} );

			expect( siteId ).to.equal( 2916284 );
		} );
	} );

	describe( '#getEditorLastDraftPostId()', () => {
		it( 'should return the last draft post ID state', () => {
			const postId = getEditorLastDraftPostId( {
				ui: {
					editor: {
						lastDraft: {
							siteId: 2916284,
							postId: 841
						}
					}
				}
			} );

			expect( postId ).to.equal( 841 );
		} );
	} );
} );
