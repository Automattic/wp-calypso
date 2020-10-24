/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getEditorLastDraftPost,
	getEditorLastDraftSiteId,
	getEditorLastDraftPostId,
} from '../selectors';
import PostQueryManager from 'calypso/lib/query-manager/post';

describe( 'selectors', () => {
	describe( '#getEditorLastDraftPost()', () => {
		test( 'should return null if no last draft set', () => {
			const post = getEditorLastDraftPost( {
				posts: {
					queries: {},
					edits: {},
				},
				editor: {
					lastDraft: {
						siteId: null,
						postId: null,
					},
				},
			} );

			expect( post ).to.be.null;
		} );

		test( 'should return last draft edited post object', () => {
			const post = getEditorLastDraftPost( {
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									title: 'Hello World',
								},
							},
						} ),
					},
					edits: {
						2916284: {
							841: [ { type: 'post' } ],
						},
					},
				},
				editor: {
					lastDraft: {
						siteId: 2916284,
						postId: 841,
					},
				},
			} );

			expect( post ).to.eql( {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Hello World',
				type: 'post',
			} );
		} );
	} );

	describe( '#getEditorLastDraftSiteId()', () => {
		test( 'should return the last draft site ID state', () => {
			const siteId = getEditorLastDraftSiteId( {
				editor: {
					lastDraft: {
						siteId: 2916284,
						postId: 841,
					},
				},
			} );

			expect( siteId ).to.equal( 2916284 );
		} );
	} );

	describe( '#getEditorLastDraftPostId()', () => {
		test( 'should return the last draft post ID state', () => {
			const postId = getEditorLastDraftPostId( {
				editor: {
					lastDraft: {
						siteId: 2916284,
						postId: 841,
					},
				},
			} );

			expect( postId ).to.equal( 841 );
		} );
	} );
} );
