/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getEditorCloseUrl from 'state/selectors/get-editor-close-url';
import getPostTypeAllPostsUrl from 'state/selectors/get-post-type-all-posts-url';
import getGutenbergEditorUrl from 'state/selectors/get-gutenberg-editor-url';
import PostQueryManager from 'lib/query-manager/post';

const postType = 'post';
const pagePostType = 'page';
const templatePostType = 'wp_template';
const siteId = 1;

describe( 'getEditorCloseUrl()', () => {
	test( 'should return URL for post type listings as default', () => {
		const state = {
			sites: {
				items: {
					[ siteId ]: { URL: 'https://fake.url.wordpress.com' },
				},
			},
			ui: { selectedSiteId: siteId, actionLog: [] },
		};

		const allPostsUrl = getPostTypeAllPostsUrl( state, postType );

		expect( getEditorCloseUrl( state, siteId, postType ) ).to.equal( allPostsUrl );
	} );

	test( 'should return parent URL if current post is a FSE template part', () => {
		const parentPostId = 123;

		const state = {
			sites: {
				items: {
					[ siteId ]: { URL: 'https://fake.url.wordpress.com' },
				},
			},
			posts: {
				items: {
					5678: [ 11111, parentPostId ],
				},
				queries: {
					11111: new PostQueryManager( {
						items: {
							[ parentPostId ]: {
								ID: parentPostId,
								site_ID: siteId,
								global_ID: 5678,
							},
						},
					} ),
				},
			},
			ui: { selectedSiteId: siteId, actionLog: [] },
		};

		const parentPostEditorUrl = getGutenbergEditorUrl( state, siteId, parentPostId, pagePostType );

		expect( getEditorCloseUrl( state, siteId, templatePostType, parentPostId ) ).to.equal(
			parentPostEditorUrl
		);
	} );

	test( 'should return URL for checklist if previous nav was from the checklist', () => {
		const siteSlug = 'fake.url.wordpress.com';
		const checklistUrl = `/checklist/${ siteSlug }`;

		const state = {
			sites: {
				items: {
					[ siteId ]: { URL: `https://${ siteSlug }` },
				},
			},
			ui: {
				route: {
					path: {
						previous: checklistUrl,
					},
				},
				selectedSiteId: siteId,
				actionLog: [],
			},
		};

		expect( getEditorCloseUrl( state, siteId, postType ) ).to.equal( checklistUrl );
	} );
} );
