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
import { ROUTE_SET } from 'state/action-types';

const postType = 'post';
const pagePostType = 'page';
const templatePostType = 'wp_template_part';
const siteId = 1;
const siteSlug = 'fake.url.wordpress.com';
const siteUrl = `https://${ siteSlug }`;
const checklistUrl = `/checklist/${ siteSlug }`;
const customerHomeUrl = `/home/${ siteSlug }`;
const blockEditorAction = { type: ROUTE_SET, path: '/block-editor/page/1' };
const checklistAction = { type: ROUTE_SET, path: checklistUrl };
const customerHomeAction = { type: ROUTE_SET, path: customerHomeUrl };

describe( 'getEditorCloseUrl()', () => {
	test( 'should return URL for post type listings as default', () => {
		const state = {
			sites: {
				items: {
					[ siteId ]: { URL: siteUrl },
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
					[ siteId ]: { URL: siteUrl },
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
		const state = {
			sites: {
				items: {
					[ siteId ]: { URL: siteUrl },
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

	test( 'should return URL for checklist if most recent non-editor nav was from the checklist', () => {
		const state = {
			sites: {
				items: {
					[ siteId ]: { URL: siteUrl },
				},
			},
			ui: {
				selectedSiteId: siteId,
				actionLog: [ customerHomeAction, checklistAction, blockEditorAction ],
			},
		};

		expect( getEditorCloseUrl( state, siteId, postType, '' ) ).to.equal( checklistUrl );
	} );

	test( 'should return URL for customer home if previous nav was from the customer home', () => {
		const state = {
			sites: {
				items: {
					[ siteId ]: { URL: siteUrl },
				},
			},
			ui: {
				route: {
					path: {
						previous: customerHomeUrl,
					},
				},
				selectedSiteId: siteId,
				actionLog: [],
			},
		};

		expect( getEditorCloseUrl( state, siteId, postType, '' ) ).to.equal( customerHomeUrl );
	} );

	test( 'should return URL for customer home if most recent non-editor nav was from the customer home', () => {
		const state = {
			sites: {
				items: {
					[ siteId ]: { URL: siteUrl },
				},
			},
			ui: {
				selectedSiteId: siteId,
				actionLog: [ checklistAction, customerHomeAction, blockEditorAction ],
			},
		};

		expect( getEditorCloseUrl( state, siteId, postType, '' ) ).to.equal( customerHomeUrl );
	} );
} );
