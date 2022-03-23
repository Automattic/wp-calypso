/**
 * @jest-environment jsdom
 */
import getEditorCloseConfig from 'calypso/state/selectors/get-editor-close-config';
import getPostTypeAllPostsUrl from 'calypso/state/selectors/get-post-type-all-posts-url';

const postType = 'post';
const undefinedPostType = undefined; // An undefined post type is a Site Editor edge case.
const siteEditorEditorType = 'site';
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
			userSettings: { settings: {} },
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
			userSettings: { settings: {} },
		};

		const allPostsUrl = getPostTypeAllPostsUrl( state, postType );

		expect( getEditorCloseConfig( state, siteId, postType ).url ).toEqual( allPostsUrl );
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
			userSettings: { settings: {} },
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
			userSettings: { settings: {} },
		};

		expect( getEditorCloseConfig( state, siteId, postType, '' ).url ).toEqual( customerHomeUrl );
	} );

	test( 'should return URL to home if postType is undefined (site editor edge case) and previous route has no match', () => {
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
			userSettings: { settings: {} },
		};

		expect( getEditorCloseConfig( state, siteId, undefinedPostType ).url ).toEqual(
			customerHomeUrl
		);
	} );

	test( 'should still return to matching route w/ undefined postType (site editor edge case)', () => {
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
			userSettings: { settings: {} },
		};

		expect( getEditorCloseConfig( state, siteId, undefinedPostType, '' ).url ).toEqual( themesUrl );
	} );

	test( 'should return to themes if last route when editorType is of value "site"', () => {
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
			userSettings: { settings: {} },
		};

		expect( getEditorCloseConfig( state, siteId, postType, siteEditorEditorType ).url ).toEqual(
			themesUrl
		);
	} );

	test( 'should return to home if editorType is "site" and last route is not themes', () => {
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
			userSettings: { settings: {} },
		};

		expect( getEditorCloseConfig( state, siteId, postType, siteEditorEditorType ).url ).toEqual(
			customerHomeUrl
		);
	} );
} );
