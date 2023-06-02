/**
 * @jest-environment jsdom
 */
import getEditorCloseConfig from 'calypso/state/selectors/get-editor-close-config';
import getPostTypeAllPostsUrl from 'calypso/state/selectors/get-post-type-all-posts-url';

const postType = 'post';
const siteEditorPostType = undefined;
const siteId = 1;
const siteSlug = 'fake.url.wordpress.com';
const siteUrl = `https://${ siteSlug }`;
const customerHomeUrl = `/home/${ siteSlug }`;
const themesUrl = `/themes/${ siteSlug }`;
const launchpadFreeSiteIntent = 'free';
const launchpadUrl = `/setup/${ launchpadFreeSiteIntent }/launchpad?siteSlug=${ siteSlug }`;

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
			userSettings: { settings: {} },
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
			userSettings: { settings: {} },
		};

		expect( getEditorCloseConfig( state, siteId, siteEditorPostType, '' ).url ).toEqual(
			themesUrl
		);
	} );

	test( 'should return to launchpad screen and update label to "next steps" if launchpad_screen option is "full"', () => {
		const state = {
			sites: {
				items: {
					[ siteId ]: {
						URL: siteUrl,
						options: {
							site_intent: launchpadFreeSiteIntent,
							launchpad_screen: 'full',
						},
					},
				},
			},

			ui: {
				selectedSiteId: siteId,
			},
		};

		const editorConfigResult = {
			url: launchpadUrl,
			label: 'Next steps',
		};

		expect( getEditorCloseConfig( state, siteId, siteEditorPostType, '' ) ).toEqual(
			editorConfigResult
		);
	} );
} );
