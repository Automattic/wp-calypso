/**
 * Internal dependencies
 */
import getEditorCloseConfig from 'calypso/state/selectors/get-editor-close-config';
import getPostTypeAllPostsUrl from 'calypso/state/selectors/get-post-type-all-posts-url';
import getGutenbergEditorUrl from 'calypso/state/selectors/get-gutenberg-editor-url';
import PostQueryManager from 'calypso/lib/query-manager/post';

const postType = 'post';
const pagePostType = 'page';
const siteEditorPostType = undefined;
const templatePostType = 'wp_template_part';
const siteId = 1;
const siteSlug = 'fake.url.wordpress.com';
const siteUrl = `https://${ siteSlug }`;
const customerHomeUrl = `/home/${ siteSlug }`;
const themesUrl = `/themes/${ siteSlug }`;

describe( 'getEditorCloseConfig()', () => {
	test( 'should return URL for customer home as default when no previous route is given', () => {
		const state = {
			sites: {
				items: {
					[ siteId ]: { URL: siteUrl },
				},
			},
			ui: { selectedSiteId: siteId },
		};

		expect( getEditorCloseConfig( state, siteId, postType ).url ).toEqual( customerHomeUrl );
	} );

	test( 'should return URL for post type listings as default when previous route has no match', () => {
		const state = {
			sites: {
				items: {
					[ siteId ]: { URL: siteUrl },
				},
			},
			route: {
				lastNonEditorRoute: '/route-with-no-match',
			},
			ui: {
				selectedSiteId: siteId,
			},
		};

		const allPostsUrl = getPostTypeAllPostsUrl( state, postType );

		expect( getEditorCloseConfig( state, siteId, postType ).url ).toEqual( allPostsUrl );
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
			ui: { selectedSiteId: siteId },
		};

		const parentPostEditorUrl = getGutenbergEditorUrl( state, siteId, parentPostId, pagePostType );

		expect( getEditorCloseConfig( state, siteId, templatePostType, parentPostId ).url ).toEqual(
			parentPostEditorUrl
		);
	} );

	test( 'should return URL for customer home if previous nav was from the customer home', () => {
		const state = {
			sites: {
				items: {
					[ siteId ]: { URL: siteUrl },
				},
			},
			route: {
				lastNonEditorRoute: customerHomeUrl,
			},
			ui: {
				selectedSiteId: siteId,
			},
		};

		expect( getEditorCloseConfig( state, siteId, postType, '' ).url ).toEqual( customerHomeUrl );
	} );

	test( 'should return URL for customer home if most recent non-editor nav was from the customer home', () => {
		const state = {
			sites: {
				items: {
					[ siteId ]: { URL: siteUrl },
				},
			},
			route: {
				lastNonEditorRoute: customerHomeUrl,
			},
			ui: {
				selectedSiteId: siteId,
			},
		};

		expect( getEditorCloseConfig( state, siteId, postType, '' ).url ).toEqual( customerHomeUrl );
	} );

	test( 'should return URL to home if postType is undefined (site editor) and previous route has no match', () => {
		const state = {
			sites: {
				items: {
					[ siteId ]: { URL: siteUrl },
				},
			},
			route: {
				lastNonEditorRoute: '/route-with-no-match',
			},
			ui: {
				selectedSiteId: siteId,
			},
		};

		expect( getEditorCloseConfig( state, siteId, siteEditorPostType ).url ).toEqual(
			customerHomeUrl
		);
	} );

	test( 'should still return to matching route w/ undefined (site editor) postType', () => {
		const state = {
			sites: {
				items: {
					[ siteId ]: { URL: siteUrl },
				},
			},
			route: {
				lastNonEditorRoute: themesUrl,
			},
			ui: {
				selectedSiteId: siteId,
			},
		};

		expect( getEditorCloseConfig( state, siteId, siteEditorPostType, '' ).url ).toEqual(
			themesUrl
		);
	} );
} );
