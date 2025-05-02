import {
	FEATURE_WOOP,
	PLAN_FREE,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED,
	WPCOM_FEATURES_ATOMIC,
} from '@automattic/calypso-products';
import { getQueryArgs } from '@wordpress/url';
import ThemeQueryManager from 'calypso/lib/query-manager/theme';
import {
	getTheme,
	getCanonicalTheme,
	getThemeRequestErrors,
	isRequestingTheme,
	getThemesForQuery,
	getLastThemeQuery,
	isRequestingThemesForQuery,
	getThemesFoundForQuery,
	getThemesLastPageForQuery,
	isThemesLastPageForQuery,
	getThemesForQueryIgnoringPage,
	isRequestingThemesForQueryIgnoringPage,
	getThemeDetailsUrl,
	getThemeSupportUrl,
	getThemeHelpUrl,
	getThemeCustomizeUrl,
	getThemeSignupUrl,
	getThemeDemoUrl,
	getThemeForumUrl,
	getPremiumThemePrice,
	getPurchasedThemes,
	getActiveTheme,
	isRequestingActiveTheme,
	isWporgTheme,
	isWpcomTheme,
	isThemeActive,
	isActivatingTheme,
	hasActivatedTheme,
	isInstallingTheme,
	isThemePremium,
	isThemePurchased,
	isPremiumThemeAvailable,
	getWpcomParentThemeId,
	getRecommendedThemes,
	areRecommendedThemesLoading,
	shouldShowTryAndCustomize,
	isExternallyManagedTheme,
	isSiteEligibleForManagedExternalThemes,
	getIsLoadingCart,
	getIsLivePreviewSupported,
	getThemeTiers,
	getThemeTier,
	getThemeTierForTheme,
} from '../selectors';

const twentyfifteen = {
	id: 'twentyfifteen',
	name: 'Twenty Fifteen',
	author: 'the WordPress team',
	screenshot:
		'https://i1.wp.com/theme.wordpress.com/wp-content/themes/pub/twentyfifteen/screenshot.png',
	stylesheet: 'pub/twentyfifteen',
	demo_uri: 'https://twentyfifteendemo.wordpress.com/',
	author_uri: 'https://wordpress.org/',
};

const freeThemeTier = {
	slug: 'free',
	name: 'Free',
	plan: PLAN_FREE,
	feature: FEATURE_WOOP,
};

const twentysixteen = {
	id: 'twentysixteen',
	name: 'Twenty Sixteen',
	author: 'the WordPress team',
	screenshot:
		'https://i0.wp.com/theme.wordpress.com/wp-content/themes/pub/twentysixteen/screenshot.png',
	stylesheet: 'pub/twentysixteen',
	demo_uri: 'https://twentysixteendemo.wordpress.com/',
	author_uri: 'https://wordpress.org/',
	theme_tier: freeThemeTier,
};

const mood = {
	id: 'mood',
	name: 'Mood',
	author: 'Automattic',
	screenshot: 'mood.jpg',
	price: '$20',
	stylesheet: 'premium/mood',
	demo_uri: 'https://mooddemo.wordpress.com/',
	author_uri: 'https://wordpress.com/themes/',
};

const quadrat = {
	id: 'quadrat',
	taxonomies: {
		theme_feature: [ { slug: 'auto-loading-homepage' } ],
	},
};

const sidekick = {
	id: 'sidekick',
	template: 'superhero',
};

const appleton = {
	id: 'appleton',
	block_theme: true,
	taxonomies: {
		theme_feature: [ { slug: 'full-site-editing' } ],
	},
};

const pendant = {
	id: 'pendant',
	block_theme: true,
	taxonomies: {
		theme_feature: [ { slug: 'full-site-editing' } ],
	},
};

const nokul = {
	id: 'nokul',
	theme_type: 'managed-external',
	block_theme: true,
	taxonomies: {
		theme_feature: [ { slug: 'full-site-editing' } ],
	},
};

jest.mock( '@automattic/calypso-config', () => {
	const mock = () => 'development';
	mock.isEnabled = jest.fn( () => {
		return true;
	} );
	return mock;
} );

describe( 'themes selectors', () => {
	beforeEach( () => {
		getTheme.memoizedSelector.cache.clear();
		getThemesForQuery.memoizedSelector.cache.clear();
		getThemesForQueryIgnoringPage.memoizedSelector.cache.clear();
		isRequestingThemesForQueryIgnoringPage.memoizedSelector.cache.clear();
	} );

	describe( '#getTheme()', () => {
		test( 'should return null if the theme is not known for the site', () => {
			const theme = getTheme(
				{
					themes: {
						queries: {},
					},
				},
				2916284,
				413
			);

			expect( theme ).toBeNull();
		} );

		test( 'should return the object for the site ID, theme ID pair', () => {
			const theme = getTheme(
				{
					themes: {
						queries: {
							2916284: new ThemeQueryManager( {
								items: { twentysixteen },
							} ),
						},
					},
				},
				2916284,
				'twentysixteen'
			);

			expect( theme ).toEqual( twentysixteen );
		} );
	} );

	describe( '#getCanonicalTheme()', () => {
		test( 'with a theme found on WP.com, should return the object fetched from there', () => {
			const theme = getCanonicalTheme(
				{
					themes: {
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { twentysixteen },
							} ),
						},
					},
				},
				2916284,
				'twentysixteen'
			);

			expect( theme ).toEqual( twentysixteen );
		} );

		test( 'with a theme found on WP.org but not on WP.com, should return the object fetched from there', () => {
			const wporgTheme = {
				id: 'twentyseventeen',
				name: 'Twenty Seventeen',
				author: 'the WordPress team',
				demo_uri: 'https://wp-themes.com/twentyseventeen',
				download: 'http://downloads.wordpress.org/theme/twentyseventeen.1.1.zip',
				taxonomies: {
					theme_feature: {
						'custom-header': 'Custom Header',
					},
				},
			};
			const theme = getCanonicalTheme(
				{
					themes: {
						queries: {
							wporg: new ThemeQueryManager( {
								items: { twentyseventeen: wporgTheme },
							} ),
						},
					},
				},
				2916284,
				'twentyseventeen'
			);

			expect( theme ).toEqual( wporgTheme );
		} );

		test( 'with a theme not found on WP.com nor on WP.org, should return the theme object from the given siteId', () => {
			const jetpackTheme = {
				id: 'twentyseventeen',
				name: 'Twenty Seventeen',
				author: 'the WordPress team',
			};

			const theme = getCanonicalTheme(
				{
					themes: {
						queries: {
							2916284: new ThemeQueryManager( {
								items: { twentyseventeen: jetpackTheme },
							} ),
						},
					},
				},
				2916284,
				'twentyseventeen'
			);

			expect( theme ).toEqual( jetpackTheme );
		} );
	} );

	describe( '#getThemesRequestError()', () => {
		test( 'should return null if thre is not request error storred for that theme on site', () => {
			const error = getThemeRequestErrors(
				{
					themes: {
						themeRequestErrors: {},
					},
				},
				'twentysixteen',
				413
			);

			expect( error ).toBeNull();
		} );

		test( 'should return the error object for the site ID, theme ID pair', () => {
			const error = getThemeRequestErrors(
				{
					themes: {
						themeRequestErrors: {
							2916284: {
								twentysixteen: 'Request error',
							},
						},
					},
				},
				'twentysixteen',
				2916284
			);

			expect( error ).toEqual( 'Request error' );
		} );
	} );

	describe( '#isRequestingTheme()', () => {
		test( 'should return false if there are no active requests for site', () => {
			const isRequesting = isRequestingTheme(
				{
					themes: {
						themeRequests: {},
					},
				},
				2916284,
				'twentyfifteen'
			);

			expect( isRequesting ).toBe( false );
		} );

		test( 'should return false if there is no active request for theme for site', () => {
			const isRequesting = isRequestingTheme(
				{
					themes: {
						themeRequests: {
							2916284: {
								twentysixteen: true,
							},
						},
					},
				},
				2916284,
				'twentyfifteen'
			);

			expect( isRequesting ).toBe( false );
		} );

		test( 'should return true if there is request ongoing for theme for site', () => {
			const isRequesting = isRequestingTheme(
				{
					themes: {
						themeRequests: {
							2916284: {
								twentysixteen: true,
							},
						},
					},
				},
				2916284,
				'twentysixteen'
			);

			expect( isRequesting ).toBe( true );
		} );
	} );

	describe( '#getThemesForQuery()', () => {
		test( 'should return null if the site query is not tracked', () => {
			const siteThemes = getThemesForQuery(
				{
					themes: {
						queries: {},
					},
				},
				2916284,
				{ search: 'Sixteen' }
			);

			expect( siteThemes ).toBeNull();
		} );

		test( 'should return null if the query is not tracked to the query manager', () => {
			const siteThemes = getThemesForQuery(
				{
					themes: {
						queries: {
							2916284: new ThemeQueryManager( {
								items: {},
								queries: {},
							} ),
						},
					},
				},
				2916284,
				{ search: 'Sixteen' }
			);

			expect( siteThemes ).toBeNull();
		} );

		test( 'should return an array of normalized known queried themes', () => {
			const siteThemes = getThemesForQuery(
				{
					themes: {
						queries: {
							2916284: new ThemeQueryManager( {
								items: {
									twentysixteen,
								},
								queries: {
									'[["search","Sixteen"]]': {
										itemKeys: [ 'twentysixteen' ],
									},
								},
							} ),
						},
					},
				},
				2916284,
				{ search: 'Sixteen' }
			);

			expect( siteThemes ).toEqual( [ twentysixteen ] );
		} );

		test( "should return null if we know the number of found items but the requested set hasn't been received", () => {
			const siteThemes = getThemesForQuery(
				{
					themes: {
						queries: {
							2916284: new ThemeQueryManager( {
								items: {
									twentyfifteen,
								},
								queries: {
									'[["search","Fifteen"]]': {
										itemKeys: [ 'twentyfifteen', undefined ],
										found: 2,
									},
								},
							} ),
						},
					},
				},
				2916284,
				{ search: 'Fifteen', number: 1, page: 2 }
			);

			expect( siteThemes ).toBeNull();
		} );
	} );

	describe( '#getLastThemeQuery', () => {
		test( 'given no site, should return empty object', () => {
			const query = getLastThemeQuery( {
				themes: {
					lastQuery: {},
				},
			} );

			expect( query ).toEqual( {} );
		} );

		test( 'given a site, should return last used query', () => {
			const query = getLastThemeQuery(
				{
					themes: {
						lastQuery: {
							2916284: { search: 'theme that has this thing and does not have the other one' },
						},
					},
				},
				2916284
			);

			expect( query ).toEqual( {
				search: 'theme that has this thing and does not have the other one',
			} );
		} );
	} );

	describe( '#isRequestingThemesForQuery()', () => {
		test( 'should return false if the site has not been queried', () => {
			const isRequesting = isRequestingThemesForQuery(
				{
					themes: {
						queryRequests: {},
					},
				},
				2916284,
				{ search: 'Sixteen' }
			);

			expect( isRequesting ).toBe( false );
		} );

		test( 'should return false if the site has not been queried for the specific query', () => {
			const isRequesting = isRequestingThemesForQuery(
				{
					themes: {
						queryRequests: {
							'2916284:{"search":"Six"}': true,
						},
					},
				},
				2916284,
				{ search: 'Sixteen' }
			);

			expect( isRequesting ).toBe( false );
		} );

		test( 'should return true if the site has been queried for the specific query', () => {
			const isRequesting = isRequestingThemesForQuery(
				{
					themes: {
						queryRequests: {
							'2916284:{"search":"Sixteen"}': true,
						},
					},
				},
				2916284,
				{ search: 'Sixteen' }
			);

			expect( isRequesting ).toBe( true );
		} );

		test( 'should return false if the site has previously, but is not currently, querying for the specified query', () => {
			const isRequesting = isRequestingThemesForQuery(
				{
					themes: {
						queryRequests: {
							'2916284:{"search":"Sixteen"}': false,
						},
					},
				},
				2916284,
				{ search: 'Sixteen' }
			);

			expect( isRequesting ).toBe( false );
		} );
	} );

	describe( '#getThemesFoundForQuery()', () => {
		test( 'should return null if the site query is not tracked', () => {
			const found = getThemesFoundForQuery(
				{
					themes: {
						queries: {},
					},
				},
				2916284,
				{ search: 'Sixteen' }
			);

			expect( found ).toBeNull();
		} );

		test( 'should return the found items for a site query', () => {
			const found = getThemesFoundForQuery(
				{
					themes: {
						queries: {
							2916284: new ThemeQueryManager( {
								items: {
									twentysixteen,
								},
								queries: {
									'[["search","Sixteen"]]': {
										itemKeys: [ 'twentysixteen' ],
										found: 1,
									},
								},
							} ),
						},
					},
				},
				2916284,
				{ search: 'Sixteen' }
			);

			expect( found ).toEqual( 1 );
		} );

		test( 'should return zero if in-fact there are zero items', () => {
			const found = getThemesFoundForQuery(
				{
					themes: {
						queries: {
							2916284: new ThemeQueryManager( {
								items: {},
								queries: {
									'[["search","Umpteen"]]': {
										itemKeys: [],
										found: 0,
									},
								},
							} ),
						},
					},
				},
				2916284,
				{ search: 'Umpteen' }
			);

			expect( found ).toEqual( 0 );
		} );
	} );

	describe( '#getThemesLastPageForQuery()', () => {
		test( 'should return null if the site query is not tracked', () => {
			const lastPage = getThemesLastPageForQuery(
				{
					sites: {
						items: {},
					},
					themes: {
						queries: {},
					},
				},
				2916284,
				{ search: 'Sixteen' }
			);

			expect( lastPage ).toBeNull();
		} );

		test( 'should return the last page value for a site query', () => {
			const lastPage = getThemesLastPageForQuery(
				{
					sites: {
						items: {},
					},
					themes: {
						queries: {
							2916284: new ThemeQueryManager( {
								items: {
									twentysixteen,
								},
								queries: {
									'[["search","Sixteen"]]': {
										itemKeys: [ 'sixteen' ],
										found: 1,
									},
								},
							} ),
						},
					},
				},
				2916284,
				{ search: 'Sixteen' }
			);

			expect( lastPage ).toEqual( 1 );
		} );

		test( 'should return the last page value for a site query, even if including page param', () => {
			const lastPage = getThemesLastPageForQuery(
				{
					sites: {
						items: {},
					},
					themes: {
						queries: {
							2916284: new ThemeQueryManager( {
								items: {
									twentysixteen,
								},
								queries: {
									'[["search","Twenty"]]': {
										itemKeys: [ 'twentysixteen' ],
										found: 7,
									},
								},
							} ),
						},
					},
				},
				2916284,
				{ search: 'Twenty', page: 3, number: 1 }
			);

			expect( lastPage ).toEqual( 7 );
		} );

		test( 'should return 1 if there are no found themes', () => {
			const lastPage = getThemesLastPageForQuery(
				{
					sites: {
						items: {},
					},
					themes: {
						queries: {
							2916284: new ThemeQueryManager( {
								items: {},
								queries: {
									'[["search","Umpteen"]]': {
										itemKeys: [],
										found: 0,
									},
								},
							} ),
						},
					},
				},
				2916284,
				{ search: 'Umpteen' }
			);

			expect( lastPage ).toEqual( 1 );
		} );

		test( 'should return 1 for a Jetpack site', () => {
			const lastPage = getThemesLastPageForQuery(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								URL: 'https://example.net',
								jetpack: true,
							},
						},
					},
					themes: {
						queries: {
							2916284: new ThemeQueryManager( {
								items: {
									twentysixteen,
								},
								queries: {
									'[["search","Twenty"]]': {
										itemKeys: [ 'twentysixteen' ],
										found: 7,
									},
								},
							} ),
						},
					},
				},
				2916284,
				{ search: 'Twenty' }
			);

			expect( lastPage ).toEqual( 1 );
		} );
	} );

	describe( '#isThemesLastPageForQuery()', () => {
		test( 'should return null if the last page is not known', () => {
			const isLastPage = isThemesLastPageForQuery(
				{
					themes: {
						queries: {},
					},
				},
				2916284,
				{ search: 'Umpteen' }
			);

			expect( isLastPage ).toBeNull();
		} );

		test( 'should return false if the query explicit value is not the last page', () => {
			const isLastPage = isThemesLastPageForQuery(
				{
					sites: {
						items: {},
					},
					themes: {
						queries: {
							2916284: new ThemeQueryManager( {
								items: {
									twentysixteen,
								},
								queries: {
									'[["search","Twenty"]]': {
										itemKeys: [ 'twentysixteen' ],
										found: 7,
									},
								},
							} ),
						},
					},
				},
				2916284,
				{ search: 'Twenty', page: 6, number: 1 }
			);

			expect( isLastPage ).toBe( false );
		} );

		test( 'should return true if the query explicit value is the last page', () => {
			const isLastPage = isThemesLastPageForQuery(
				{
					sites: {
						items: {},
					},
					themes: {
						queries: {
							2916284: new ThemeQueryManager( {
								items: {
									twentysixteen,
								},
								queries: {
									'[["search","Twenty"]]': {
										itemKeys: [ 'twentysixteen' ],
										found: 7,
									},
								},
							} ),
						},
					},
				},
				2916284,
				{ search: 'Twenty', page: 7, number: 1 }
			);

			expect( isLastPage ).toBe( true );
		} );

		test( 'should return true if the query implicit value is the last page', () => {
			const isLastPage = isThemesLastPageForQuery(
				{
					sites: {
						items: {},
					},
					themes: {
						queries: {
							2916284: new ThemeQueryManager( {
								items: {
									twentysixteen,
								},
								queries: {
									'[["search","Sixteen"]]': {
										itemKeys: [ 'twentysixteen' ],
										found: 1,
									},
								},
							} ),
						},
					},
				},
				2916284,
				{ search: 'Sixteen', number: 1 }
			);

			expect( isLastPage ).toBe( true );
		} );

		test( 'should return true for a Jetpack site', () => {
			const isLastPage = isThemesLastPageForQuery(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								URL: 'https://example.net',
								jetpack: true,
							},
						},
					},
					themes: {
						queries: {
							2916284: new ThemeQueryManager( {
								items: {
									twentysixteen,
								},
								queries: {
									'[["search","Twenty"]]': {
										itemKeys: [ 'twentysixteen' ],
										found: 7,
									},
								},
							} ),
						},
					},
				},
				2916284,
				{ search: 'Twenty' }
			);

			expect( isLastPage ).toBe( true );
		} );
	} );

	describe( '#getThemesForQueryIgnoringPage()', () => {
		test( 'should return null if the query is not tracked', () => {
			const themes = getThemesForQueryIgnoringPage(
				{
					sites: {
						plans: {},
					},
					themes: {
						queries: {},
					},
				},
				2916284,
				{ search: '', number: 1 }
			);

			expect( themes ).toBeNull();
		} );

		test( 'should return null if the query manager has not received items for query', () => {
			const themes = getThemesForQueryIgnoringPage(
				{
					sites: {
						plans: {},
					},
					themes: {
						queries: {
							2916284: new ThemeQueryManager( {
								items: {},
								queries: {},
							} ),
						},
					},
				},
				2916284,
				{ search: '', number: 1 }
			);

			expect( themes ).toBeNull();
		} );

		test( 'should return a concatenated array of all site themes ignoring page', () => {
			const themes = getThemesForQueryIgnoringPage(
				{
					sites: {
						plans: {},
					},
					themes: {
						queries: {
							2916284: new ThemeQueryManager( {
								items: {
									twentyfifteen,
									twentysixteen,
								},
								queries: {
									'[]': {
										itemKeys: [ 'twentyfifteen', 'twentysixteen' ],
									},
								},
							} ),
						},
						recommendedThemes: {
							themes: [],
						},
					},
				},
				2916284,
				{ search: '', number: 1 }
			);

			expect( themes ).toEqual( [ twentyfifteen, twentysixteen ] );
		} );

		test( 'should remove recommendedThemes with no filter and no search in query', () => {
			const themes = getThemesForQueryIgnoringPage(
				{
					sites: {
						plans: {},
					},
					themes: {
						queries: {
							2916284: new ThemeQueryManager( {
								items: {
									twentyfifteen,
									twentysixteen,
								},
								queries: {
									'[]': {
										itemKeys: [ 'twentyfifteen', 'twentysixteen' ],
									},
								},
							} ),
						},
						recommendedThemes: {
							themes: [ { id: 'twentyfifteen' } ],
						},
					},
				},
				2916284,
				{ search: '', number: 1 }
			);
			expect( themes ).toEqual( [ twentysixteen ] );
		} );

		test( "should omit found items for which the requested result hasn't been received", () => {
			const themes = getThemesForQueryIgnoringPage(
				{
					sites: {
						plans: {},
					},
					themes: {
						queries: {
							2916284: new ThemeQueryManager( {
								items: {
									twentysixteen,
								},
								queries: {
									'[["search","Sixteen"]]': {
										itemKeys: [ 'twentysixteen', undefined ],
										found: 2,
									},
								},
							} ),
						},
					},
				},
				2916284,
				{ search: 'Sixteen', number: 1 }
			);

			expect( themes ).toEqual( [ twentysixteen ] );
		} );
	} );

	describe( '#isRequestingThemesForQueryIgnoringPage()', () => {
		test( 'should return false if not requesting for query', () => {
			const isRequesting = isRequestingThemesForQueryIgnoringPage(
				{
					themes: {
						queryRequests: {},
					},
				},
				2916284,
				{ search: 'twen' }
			);

			expect( isRequesting ).toBe( false );
		} );

		test( 'should return true requesting for query at exact page', () => {
			const isRequesting = isRequestingThemesForQueryIgnoringPage(
				{
					themes: {
						queryRequests: {
							'2916284:{"search":"twen","page":4}': true,
						},
					},
				},
				2916284,
				{ search: 'twen', page: 4 }
			);

			expect( isRequesting ).toBe( true );
		} );

		test( 'should return true requesting for query without page specified', () => {
			const isRequesting = isRequestingThemesForQueryIgnoringPage(
				{
					themes: {
						queryRequests: {
							'2916284:{"search":"twen","page":4}': true,
						},
					},
				},
				2916284,
				{ search: 'twen' }
			);

			expect( isRequesting ).toBe( true );
		} );
	} );

	describe( '#getThemeDetailsUrl', () => {
		test( 'given a theme and no site ID, should return the Calypso theme sheet URL', () => {
			const detailsUrl = getThemeDetailsUrl(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.wordpress.com',
							},
						},
					},
				},
				'twentysixteen'
			);
			expect( detailsUrl ).toEqual( '/theme/twentysixteen' );
		} );

		test( 'given a theme and wpcom site ID, should return the Calypso theme sheet URL', () => {
			const detailsUrl = getThemeDetailsUrl(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.wordpress.com',
							},
						},
					},
				},
				'twentysixteen',
				2916284
			);
			expect( detailsUrl ).toEqual( '/theme/twentysixteen/example.wordpress.com' );
		} );
	} );

	describe( '#getThemeSupportUrl', () => {
		describe( 'for a premium theme', () => {
			test( 'given no site ID, should return the support URL', () => {
				const supportUrl = getThemeSupportUrl(
					{
						sites: {
							items: {
								2916284: {
									ID: 2916284,
									URL: 'https://example.wordpress.com',
								},
							},
						},
						themes: {
							queries: {
								wpcom: new ThemeQueryManager( {
									items: { mood },
								} ),
							},
						},
					},
					'mood'
				);
				expect( supportUrl ).toEqual( '/theme/mood/setup' );
			} );

			test( 'given a wpcom site ID, should return the support URL', () => {
				const supportUrl = getThemeSupportUrl(
					{
						sites: {
							items: {
								2916284: {
									ID: 2916284,
									URL: 'https://example.wordpress.com',
								},
							},
						},
						themes: {
							queries: {
								wpcom: new ThemeQueryManager( {
									items: { mood },
								} ),
							},
						},
					},
					'mood',
					2916284
				);
				expect( supportUrl ).toEqual( '/theme/mood/setup/example.wordpress.com' );
			} );
		} );

		describe( 'for a free theme', () => {
			test( 'given no site ID, should return null', () => {
				const supportUrl = getThemeSupportUrl(
					{
						sites: {
							items: {
								2916284: {
									ID: 2916284,
									URL: 'https://example.wordpress.com',
								},
							},
						},
						themes: {
							queries: {
								wpcom: new ThemeQueryManager( {
									items: { twentysixteen },
								} ),
							},
						},
					},
					'twentysixteen'
				);
				expect( supportUrl ).toBeNull();
			} );

			test( 'given a wpcom site ID, should return null', () => {
				const supportUrl = getThemeSupportUrl(
					{
						sites: {
							items: {
								2916284: {
									ID: 2916284,
									URL: 'https://example.wordpress.com',
								},
							},
						},
						themes: {
							queries: {
								wpcom: new ThemeQueryManager( {
									items: { twentysixteen },
								} ),
							},
						},
					},
					'twentysixteen',
					2916284
				);
				expect( supportUrl ).toBeNull();
			} );

			test( 'given a Jetpack site ID, should return null', () => {
				const supportUrl = getThemeSupportUrl(
					{
						sites: {
							items: {
								77203074: {
									ID: 77203074,
									URL: 'https://example.net',
									jetpack: true,
									options: {
										admin_url: 'https://example.net/wp-admin/',
									},
								},
							},
						},
						themes: {
							queries: {
								wpcom: new ThemeQueryManager( {
									items: { twentysixteen },
								} ),
							},
						},
					},
					'twentysixteen',
					77203074
				);
				expect( supportUrl ).toBeNull();
			} );
		} );
	} );

	describe( '#getThemeHelpUrl', () => {
		test( 'given a theme and no site ID, should return the help URL', () => {
			const helpUrl = getThemeHelpUrl(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.wordpress.com',
							},
						},
					},
				},
				'mood'
			);
			expect( helpUrl ).toEqual( '/theme/mood/support' );
		} );

		test( 'given a theme and a wpcom site ID, should return the correct help URL', () => {
			const helpUrl = getThemeHelpUrl(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.wordpress.com',
							},
						},
					},
					themes: {
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { mood },
							} ),
						},
					},
				},
				'mood',
				2916284
			);
			expect( helpUrl ).toEqual( '/theme/mood/support/example.wordpress.com' );
		} );

		test( 'given a theme and Jetpack site ID, should return the help url', () => {
			const helpUrl = getThemeHelpUrl(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								URL: 'https://example.net',
								jetpack: true,
								options: {
									admin_url: 'https://example.net/wp-admin/',
								},
							},
						},
					},
				},
				'twentysixteen',
				77203074
			);
			expect( helpUrl ).toEqual( '/theme/twentysixteen/support/example.net' );
		} );
	} );

	describe( '#getThemeCustomizeUrl', () => {
		test( 'given no theme and no site ID, should return the correct customize URL', () => {
			const customizeUrl = getThemeCustomizeUrl( {
				sites: {
					items: {},
				},
			} );
			expect( customizeUrl ).toEqual( null );
		} );

		test( 'given a theme and no site ID, should return the correct customize URL', () => {
			const customizeUrl = getThemeCustomizeUrl(
				{
					sites: {
						items: {},
					},
				},
				'twentysixteen'
			);
			expect( customizeUrl ).toEqual( null );
		} );

		test( 'given a theme and wpcom site ID, should return the correct customize URL', () => {
			const customizeUrl = getThemeCustomizeUrl(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.wordpress.com',
								options: {
									admin_url: 'https://example.wordpress.com/wp-admin/',
								},
							},
						},
					},
					themes: {
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { twentysixteen },
							} ),
						},
						activeThemes: {},
					},
				},
				'twentysixteen',
				2916284
			);
			expect( customizeUrl ).toEqual(
				'https://example.wordpress.com/wp-admin/customize.php?theme=pub/twentysixteen'
			);
		} );

		test( 'given a theme and wpcom site ID on which that theme is active, should return the correct customize URL', () => {
			const customizeUrl = getThemeCustomizeUrl(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.wordpress.com',
								options: {
									admin_url: 'https://example.wordpress.com/wp-admin/',
								},
							},
						},
					},
					themes: {
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { twentysixteen },
							} ),
						},
						activeThemes: {
							2916284: 'twentysixteen',
						},
					},
				},
				'twentysixteen',
				2916284
			);
			expect( customizeUrl ).toEqual( 'https://example.wordpress.com/wp-admin/customize.php' );
		} );

		describe( 'on a Jetpack site', () => {
			describe( 'with a non-WP.com theme', () => {
				const state = {
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								URL: 'https://example.net',
								jetpack: true,
								options: {
									admin_url: 'https://example.net/wp-admin/',
								},
							},
						},
					},
					themes: {
						queries: {
							77203074: new ThemeQueryManager( {
								items: { twentysixteen },
							} ),
						},
						activeThemes: {},
					},
				};

				describe( 'in the browser', () => {
					beforeEach( () => {
						global.window = {
							location: {
								href: 'https://wordpress.com',
							},
						};
					} );

					afterEach( () => {
						global.window = undefined;
					} );

					test( 'should return customizer URL with return arg and un-suffixed theme ID', () => {
						const customizeUrl = getThemeCustomizeUrl( state, 'twentysixteen', 77203074 );
						expect( customizeUrl ).toEqual(
							'https://example.net/wp-admin/customize.php?return=https%3A%2F%2Fwordpress.com&theme=twentysixteen'
						);
					} );
				} );

				describe( 'on the server', () => {
					test( 'should return customizer URL with un-suffixed theme ID', () => {
						const customizeUrl = getThemeCustomizeUrl( state, 'twentysixteen', 77203074 );
						expect( customizeUrl ).toEqual(
							'https://example.net/wp-admin/customize.php?theme=twentysixteen'
						);
					} );
				} );
			} );

			describe( 'with a WP.com theme', () => {
				const state = {
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								URL: 'https://example.net',
								jetpack: true,
								options: {
									admin_url: 'https://example.net/wp-admin/',
								},
							},
						},
					},
					themes: {
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { twentysixteen },
							} ),
						},
						activeThemes: {},
					},
				};

				describe( 'in the browser', () => {
					beforeEach( () => {
						global.window = {
							location: {
								href: 'https://wordpress.com',
							},
						};
					} );

					afterEach( () => {
						global.window = undefined;
					} );

					test( 'should return customizer URL with return arg and unsuffixed theme ID', () => {
						const customizeUrl = getThemeCustomizeUrl( state, 'twentysixteen', 77203074 );
						expect( customizeUrl ).toEqual(
							'https://example.net/wp-admin/customize.php?return=https%3A%2F%2Fwordpress.com&theme=twentysixteen'
						);
					} );
				} );

				describe( 'on the server', () => {
					test( 'should return customizer URL with unsuffixed theme ID', () => {
						const customizeUrl = getThemeCustomizeUrl( state, 'twentysixteen', 77203074 );
						expect( customizeUrl ).toEqual(
							'https://example.net/wp-admin/customize.php?theme=twentysixteen'
						);
					} );
				} );
			} );
		} );
	} );

	describe( '#getThemeSignupUrl', () => {
		test( 'given a free theme, should return the correct signup URL', () => {
			const signupUrl = getThemeSignupUrl(
				{
					themes: {
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { twentysixteen },
							} ),
						},
					},
				},
				'twentysixteen'
			);

			expect( signupUrl ).toEqual(
				'/start/with-theme?ref=calypshowcase&theme=twentysixteen&theme_type=free&intervalType=yearly'
			);
		} );

		test( 'given a premium theme, should return the correct signup URL', () => {
			const signupUrl = getThemeSignupUrl(
				{
					themes: {
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { mood },
							} ),
						},
					},
				},
				'mood'
			);

			const queryArgs = getQueryArgs( signupUrl );

			expect( signupUrl.startsWith( '/start/with-theme' ) ).toBe( true );
			expect( queryArgs ).toEqual( {
				ref: 'calypshowcase',
				theme: 'mood',
				premium: 'true',
				theme_type: 'premium',
				intervalType: 'yearly',
			} );
		} );
	} );

	describe( '#getThemeDemoUrl', () => {
		test( 'with a theme not found on WP.com nor on WP.org, should return null', () => {
			const demoUrl = getThemeDemoUrl(
				{
					themes: {
						queries: {},
					},
				},
				'twentysixteen',
				2916284
			);

			expect( demoUrl ).toBeUndefined();
		} );

		test( "with a theme found on WP.com, should return that object's demo_uri field", () => {
			const demoUrl = getThemeDemoUrl(
				{
					themes: {
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { twentysixteen },
							} ),
						},
					},
				},
				'twentysixteen',
				2916284
			);

			expect( demoUrl ).toEqual( 'https://twentysixteendemo.wordpress.com/' );
		} );

		test( "with a theme found on WP.org but not on WP.com, should return that object's demo_uri field", () => {
			const wporgTheme = {
				id: 'twentyseventeen',
				name: 'Twenty Seventeen',
				author: 'the WordPress team',
				demo_uri: 'https://wp-themes.com/twentyseventeen',
				download: 'http://downloads.wordpress.org/theme/twentyseventeen.1.1.zip',
				taxonomies: {
					theme_feature: {
						'custom-header': 'Custom Header',
					},
				},
			};
			const demoUrl = getThemeDemoUrl(
				{
					themes: {
						queries: {
							wporg: new ThemeQueryManager( {
								items: { twentyseventeen: wporgTheme },
							} ),
						},
					},
				},
				'twentyseventeen',
				2916284
			);

			expect( demoUrl ).toEqual( 'https://wp-themes.com/twentyseventeen' );
		} );
	} );

	describe( '#getThemeForumUrl', () => {
		describe( 'on a WP.com site', () => {
			test( 'given a free theme, should return the general support forum URL', () => {
				const forumUrl = getThemeForumUrl(
					{
						sites: {
							items: {},
						},
						themes: {
							queries: {
								wpcom: new ThemeQueryManager( {
									items: { twentysixteen },
								} ),
							},
						},
					},
					'twentysixteen'
				);

				expect( forumUrl ).toEqual( '//wordpress.com/forums/' );
			} );

			test( 'given a premium theme, should return the general support forum URL', () => {
				const forumUrl = getThemeForumUrl(
					{
						sites: {
							items: {},
						},
						themes: {
							queries: {
								wpcom: new ThemeQueryManager( {
									items: { mood },
								} ),
							},
						},
					},
					'mood'
				);

				expect( forumUrl ).toEqual( '//wordpress.com/forums/' );
			} );
		} );

		describe( 'on a Jetpack site', () => {
			test( "given a theme that's found on neither WP.com nor WP.org, should return null", () => {
				const forumUrl = getThemeForumUrl(
					{
						sites: {
							items: {
								77203074: {
									ID: 77203074,
									URL: 'https://example.net',
									jetpack: true,
								},
							},
						},
						themes: {
							queries: {},
						},
					},
					'twentysixteen',
					77203074
				);

				expect( forumUrl ).toBeNull();
			} );

			test( "given a theme that's found on WP.com, should return the generic WP.com support forum URL", () => {
				const forumUrl = getThemeForumUrl(
					{
						sites: {
							items: {
								77203074: {
									ID: 77203074,
									URL: 'https://example.net',
									jetpack: true,
								},
							},
						},
						themes: {
							queries: {
								wpcom: new ThemeQueryManager( {
									items: { twentysixteen },
								} ),
							},
						},
					},
					'twentysixteen',
					77203074
				);

				expect( forumUrl ).toEqual( '//wordpress.com/forums/' );
			} );

			test( "given a theme that's found on WP.org, should return the correspoding WP.org theme forum URL", () => {
				const jetpackTheme = {
					id: 'twentyseventeen',
					name: 'Twenty Seventeen',
					author: 'the WordPress team',
				};
				const wporgTheme = {
					demo_uri: 'https://wp-themes.com/twentyseventeen',
					download: 'http://downloads.wordpress.org/theme/twentyseventeen.1.1.zip',
					taxonomies: {
						theme_feature: {
							'custom-header': 'Custom Header',
						},
					},
				};

				const forumUrl = getThemeForumUrl(
					{
						sites: {
							items: {
								77203074: {
									ID: 77203074,
									URL: 'https://example.net',
									jetpack: true,
								},
							},
						},
						themes: {
							queries: {
								77203074: new ThemeQueryManager( {
									items: { twentyseventeen: jetpackTheme },
								} ),
								wporg: new ThemeQueryManager( {
									items: { twentyseventeen: wporgTheme },
								} ),
							},
						},
					},
					'twentyseventeen',
					77203074
				);

				expect( forumUrl ).toEqual( '//wordpress.org/support/theme/twentyseventeen' );
			} );
		} );
	} );

	describe( '#getActiveTheme', () => {
		test( 'given no site, should return null', () => {
			const activeTheme = getActiveTheme( {
				themes: {
					activeThemes: {},
				},
			} );

			expect( activeTheme ).toBeNull();
		} );

		test( 'given a site, should return its currently active theme', () => {
			const activeTheme = getActiveTheme(
				{
					themes: {
						activeThemes: {
							2916284: 'twentysixteen',
						},
					},
				},
				2916284
			);

			expect( activeTheme ).toEqual( 'twentysixteen' );
		} );

		test( 'given a site, should return its currently active theme without -wpcom suffix', () => {
			const activeTheme = getActiveTheme(
				{
					themes: {
						activeThemes: {
							2916284: 'twentysixteen-wpcom',
						},
					},
				},
				2916284
			);

			expect( activeTheme ).toEqual( 'twentysixteen' );
		} );
	} );

	describe( '#isThemeActive', () => {
		test( 'given no theme and no site, should return false', () => {
			const isActive = isThemeActive( {
				themes: {
					activeThemes: {
						2916284: 'twentysixteen',
					},
					queries: {
						wpcom: new ThemeQueryManager( {} ),
					},
				},
			} );

			expect( isActive ).toBe( false );
		} );

		test( 'given a theme but no site, should return false', () => {
			const isActive = isThemeActive(
				{
					themes: {
						activeThemes: {
							2916284: 'twentysixteen',
						},
						queries: {
							wpcom: new ThemeQueryManager( {} ),
						},
					},
				},
				'mood'
			);

			expect( isActive ).toBe( false );
		} );

		test( "given a theme and a site on which it isn't active, should return false", () => {
			const isActive = isThemeActive(
				{
					themes: {
						activeThemes: {
							2916284: 'twentysixteen',
						},
						queries: {
							wpcom: new ThemeQueryManager( {} ),
						},
					},
					sites: {
						items: {
							2916284: { ID: 2916284, jetpack: false },
						},
					},
				},
				'mood',
				2916284
			);

			expect( isActive ).toBe( false );
		} );

		test( 'given a theme and a site on which it is active, should return true', () => {
			const isActive = isThemeActive(
				{
					themes: {
						activeThemes: {
							2916284: 'mood',
						},
						queries: {
							wpcom: new ThemeQueryManager( {} ),
						},
					},
					sites: {
						items: {
							2916284: { ID: 2916284, jetpack: false },
						},
					},
				},
				'mood',
				2916284
			);

			expect( isActive ).toBe( true );
		} );

		test( 'given a wpcom theme and a jetpack site on which it is active, should return true', () => {
			const isActive = isThemeActive(
				{
					themes: {
						activeThemes: {
							77203074: 'karuna-wpcom',
						},
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { karuna: { id: 'karuna' } },
							} ),
						},
					},
					sites: {
						items: {
							77203074: { ID: 77203074, URL: 'https://example.net', jetpack: true },
						},
					},
				},
				'karuna',
				77203074
			);

			expect( isActive ).toBe( true );
		} );
	} );

	describe( '#isActivatingTheme', () => {
		test( 'given no site, should return false', () => {
			const activating = isActivatingTheme( {
				themes: {
					activationRequests: {},
				},
			} );

			expect( activating ).toBe( false );
		} );

		test( 'given a site, should return true if theme is currently activated', () => {
			const activating = isActivatingTheme(
				{
					themes: {
						activationRequests: {
							2916284: true,
						},
					},
				},
				2916284
			);

			expect( activating ).toBe( true );
		} );
	} );

	describe( '#hasActivatedTheme', () => {
		test( 'given no site, should return false', () => {
			const activated = hasActivatedTheme( {
				themes: {
					completedActivationRequests: {},
				},
			} );

			expect( activated ).toBe( false );
		} );

		test( 'given a site, should return true if theme has been activated', () => {
			const activated = hasActivatedTheme(
				{
					themes: {
						completedActivationRequests: {
							2916284: true,
						},
					},
				},
				2916284
			);

			expect( activated ).toBe( true );
		} );
	} );

	describe( '#isRequestingActiveTheme', () => {
		test( 'given empty state, should return false', () => {
			const isRequesting = isRequestingActiveTheme( {
				themes: {
					activeThemeRequests: {},
				},
			} );

			expect( isRequesting ).toBe( false );
		} );

		test( 'given no active request, should return false', () => {
			const isRequesting = isRequestingActiveTheme(
				{
					themes: {
						activeThemeRequests: {
							2916284: false,
						},
					},
				},
				2916284
			);

			expect( isRequesting ).toBe( false );
		} );

		test( 'given pending action request, should return true', () => {
			const isRequesting = isRequestingActiveTheme(
				{
					themes: {
						activeThemeRequests: {
							2916284: true,
						},
					},
				},
				2916284
			);

			expect( isRequesting ).toBe( true );
		} );
	} );

	describe( '#isInstallingTheme', () => {
		test( 'given no site, should return false', () => {
			const installing = isInstallingTheme( {
				themes: {
					themeInstalls: {},
				},
			} );

			expect( installing ).toBe( false );
		} );

		test( 'given a site, should return true if theme is currently being installed', () => {
			const installing = isInstallingTheme(
				{
					themes: {
						themeInstalls: {
							2916284: {
								karuna: true,
							},
						},
						queries: {
							wpcom: new ThemeQueryManager( {} ),
						},
					},
					sites: {
						items: {
							2916284: { ID: 2916284, jetpack: false },
						},
					},
				},
				'karuna',
				2916284
			);

			expect( installing ).toBe( true );
		} );

		test( 'given a jetpack site and wpcom theme, should return true if theme is currently being installed', () => {
			const installing = isInstallingTheme(
				{
					themes: {
						themeInstalls: {
							77203074: {
								'karuna-wpcom': true,
							},
						},
						queries: {
							wpcom: new ThemeQueryManager( {
								items: {
									karuna: {
										id: 'karuna',
										download: 'https://public-api.wordpress.com/rest/v1/themes/download/karuna.zip',
									},
								},
							} ),
						},
					},
					sites: {
						items: {
							77203074: { ID: 77203074, URL: 'https://example.net', jetpack: true },
						},
					},
				},
				'karuna',
				77203074
			);

			expect( installing ).toBe( true );
		} );
	} );

	describe( '#isWporgTheme()', () => {
		test( 'should return false if theme is not found on WP.org', () => {
			const isWporg = isWporgTheme(
				{
					themes: {
						queries: {},
					},
				},
				'twentyseventeen'
			);

			expect( isWporg ).toBe( false );
		} );

		test( 'should return true if theme is found on WP.org', () => {
			const wporgTheme = {
				id: 'twentyseventeen',
				name: 'Twenty Seventeen',
				author: 'wordpressdotorg',
				demo_uri: 'https://wp-themes.com/twentyseventeen',
				download: 'http://downloads.wordpress.org/theme/twentyseventeen.1.1.zip',
				taxonomies: {
					theme_feature: {
						'custom-header': 'Custom Header',
					},
				},
			};
			const isWporg = isWporgTheme(
				{
					themes: {
						queries: {
							wporg: new ThemeQueryManager( {
								items: { twentyseventeen: wporgTheme },
							} ),
						},
					},
				},
				'twentyseventeen'
			);

			expect( isWporg ).toBe( true );
		} );
	} );

	describe( '#isWpcomTheme()', () => {
		test( 'should return false if theme is not found on WP.com', () => {
			const isWpcom = isWporgTheme(
				{
					themes: {
						queries: {},
					},
				},
				'twentysixteen'
			);

			expect( isWpcom ).toBe( false );
		} );

		test( 'should return true if theme is found on WP.com', () => {
			const isWpcom = isWpcomTheme(
				{
					themes: {
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { twentysixteen },
							} ),
						},
					},
				},
				'twentysixteen'
			);

			expect( isWpcom ).toBe( true );
		} );
	} );

	describe( '#isPremium()', () => {
		test( 'given no theme object, should return false', () => {
			const premium = isThemePremium( {
				themes: {
					queries: {},
				},
			} );
			expect( premium ).toBe( false );
		} );

		test( "given the ID of a theme that doesn't exist, should return false", () => {
			const premium = isThemePremium(
				{
					themes: {
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { twentysixteen },
							} ),
						},
					},
				},
				'twentyumpteen'
			);
			expect( premium ).toBe( false );
		} );

		test( 'given the ID of a free theme, should return false', () => {
			const premium = isThemePremium(
				{
					themes: {
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { twentysixteen },
							} ),
						},
					},
				},
				'twentysixteen'
			);
			expect( premium ).toBe( false );
		} );

		test( 'given the ID of a premium theme, should return true', () => {
			const premium = isThemePremium(
				{
					themes: {
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { mood },
							} ),
						},
					},
				},
				'mood'
			);
			expect( premium ).toBe( true );
		} );
	} );

	describe( '#isThemePurchased', () => {
		test( 'given no theme and no site, should return false', () => {
			const isPurchased = isThemePurchased( {
				purchases: {
					data: [
						{
							ID: 1234567,
							blog_id: 2916284,
							meta: 'mood',
							product_type: 'theme',
						},
					],
				},
			} );

			expect( isPurchased ).toBe( false );
		} );

		test( 'given a theme but no site, should return false', () => {
			const isPurchased = isThemePurchased(
				{
					purchases: {
						data: [
							{
								ID: 1234567,
								blog_id: 2916284,
								meta: 'mood',
								product_type: 'theme',
							},
						],
					},
				},
				'mood'
			);

			expect( isPurchased ).toBe( false );
		} );

		test( 'given a theme that has not been purchased on a given site, should return false', () => {
			const isPurchased = isThemePurchased(
				{
					purchases: {
						data: [
							{
								ID: 1234567,
								blog_id: 2916284,
								meta: 'mood',
								product_type: 'theme',
							},
						],
					},
				},
				'espresso',
				2916284
			);

			expect( isPurchased ).toBe( false );
		} );

		test( 'given a theme that has been purchased on a given site, should return true', () => {
			const isPurchased = isThemePurchased(
				{
					purchases: {
						data: [
							{
								ID: 1234567,
								blog_id: 2916284,
								meta: 'mood',
								product_type: 'theme',
							},
						],
					},
				},
				'mood',
				2916284
			);

			expect( isPurchased ).toBe( true );
		} );
	} );

	describe( '#getPurchasedThemes', () => {
		test( 'given 2 purchased themes, return 2 theme names', () => {
			const purchases = getPurchasedThemes(
				{
					purchases: {
						data: [
							{
								ID: 1234567,
								blog_id: 2916284,
								meta: 'mood',
								product_type: 'theme',
							},
							{
								ID: 1234568,
								blog_id: 2916284,
								meta: 'skivers',
								product_type: 'theme',
							},
						],
					},
				},
				2916284
			);
			expect( purchases ).toEqual( [ 'mood', 'skivers' ] );
		} );
		test( 'given 0 purchased themes, return empty array', () => {
			const purchases = getPurchasedThemes(
				{
					purchases: {
						data: [],
					},
				},
				2916284
			);
			expect( purchases ).toEqual( [] );
		} );
		test( 'given 2 purchased themes and a query against a different blog, return empty array', () => {
			const purchases = getPurchasedThemes(
				{
					purchases: {
						data: [
							{
								ID: 1234567,
								blog_id: 2916284,
								meta: 'mood',
								product_type: 'theme',
							},
							{
								ID: 1234568,
								blog_id: 2916284,
								meta: 'skivers',
								product_type: 'theme',
							},
						],
					},
				},
				11111
			);
			expect( purchases ).toEqual( [] );
		} );
	} );

	describe( '#isPremiumThemeAvailable', () => {
		test( 'given no theme and no site, should return false', () => {
			const isAvailable = isPremiumThemeAvailable( {
				themes: {
					queries: {},
				},
				purchases: {
					data: [
						{
							ID: 1234567,
							blog_id: 2916284,
							meta: 'mood',
							product_type: 'theme',
						},
					],
				},
			} );

			expect( isAvailable ).toBe( false );
		} );

		test( 'given a theme but no site, should return false', () => {
			const isAvailable = isPremiumThemeAvailable(
				{
					themes: {
						queries: {},
					},
					purchases: {
						data: [
							{
								ID: 1234567,
								blog_id: 2916284,
								meta: 'mood',
								product_type: 'theme',
							},
						],
					},
				},
				'espresso'
			);

			expect( isAvailable ).toBe( false );
		} );

		test( 'given a theme that has been purchased on a given site, should return true', () => {
			const isAvailable = isPremiumThemeAvailable(
				{
					sites: {
						plans: {
							2916284: {
								data: [
									{
										currentPlan: true,
										productSlug: PLAN_FREE,
									},
								],
							},
						},
					},
					themes: {
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { mood },
							} ),
						},
					},
					purchases: {
						data: [
							{
								ID: 1234567,
								blog_id: 2916284,
								meta: 'mood',
								product_type: 'theme',
							},
						],
					},
				},
				'mood',
				2916284
			);

			expect( isAvailable ).toBe( true );
		} );

		test( 'given a theme that has not been purchased on a given site, should return false', () => {
			const isAvailable = isPremiumThemeAvailable(
				{
					sites: {
						plans: {
							2916284: {
								data: [
									{
										currentPlan: true,
										productSlug: PLAN_FREE,
									},
								],
							},
						},
					},
					themes: {
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { mood },
							} ),
						},
					},
					purchases: {
						data: [
							{
								ID: 1234567,
								blog_id: 2916284,
								meta: 'espresso',
								product_type: 'theme',
							},
						],
					},
				},
				'mood',
				2916284
			);

			expect( isAvailable ).toBe( false );
		} );

		test( 'given a premium squared theme and a site without the premium upgrade, should return false', () => {
			const isAvailable = isPremiumThemeAvailable(
				{
					sites: {
						items: {
							2916284: {},
						},
						plans: {
							2916284: {
								data: [
									{
										currentPlan: true,
										productSlug: PLAN_FREE,
									},
								],
							},
						},
					},
					themes: {
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { mood },
							} ),
						},
					},
					purchases: {
						data: [],
					},
				},
				'mood',
				2916284
			);

			expect( isAvailable ).toBe( false );
		} );

		test( 'given a premium squared theme and a site with the premium upgrade, should return true', () => {
			const active = [ WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED ];
			const isAvailable = isPremiumThemeAvailable(
				{
					sites: {
						items: {
							2916284: {},
						},
						plans: {
							2916284: {
								data: [
									{
										currentPlan: true,
										productSlug: PLAN_PREMIUM,
									},
								],
							},
						},
						features: {
							2916284: {
								data: {
									active,
								},
							},
						},
					},
					themes: {
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { mood },
							} ),
						},
					},
					purchases: {
						data: [],
					},
				},
				'mood',
				2916284
			);

			expect( isAvailable ).toBe( true );
		} );

		test( 'given a site with the unlimited premium themes bundle, should return true', () => {
			const active = [ WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED ];
			[ PLAN_BUSINESS, PLAN_ECOMMERCE ].forEach( ( plan ) => {
				const isAvailable = isPremiumThemeAvailable(
					{
						sites: {
							items: {
								2916284: {},
							},
							plans: {
								2916284: {
									data: [
										{
											currentPlan: true,
											productSlug: plan,
										},
									],
								},
							},
							features: {
								2916284: {
									data: {
										active,
									},
								},
							},
						},
						themes: {
							queries: {
								wpcom: new ThemeQueryManager( {
									items: { mood },
								} ),
							},
						},
						purchases: {
							data: [],
						},
					},
					'mood',
					2916284
				);

				expect( isAvailable ).toBe( true );
			} );
		} );

		test( "Should return false when the customer has a premium plan but didn't purchase a externally managed theme", () => {
			const active = [ WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED ];
			const isAvailable = isPremiumThemeAvailable(
				{
					sites: {
						items: {
							2916284: {},
						},
						plans: {
							2916284: {
								data: [
									{
										currentPlan: true,
										productSlug: PLAN_PREMIUM,
									},
								],
							},
						},
						features: {
							2916284: {
								data: {
									active,
								},
							},
						},
					},
					themes: {
						queries: {
							wpcom: new ThemeQueryManager( {
								items: {
									mood: {
										...mood,
										theme_type: 'managed-external',
									},
								},
							} ),
						},
					},
					purchases: {
						data: [],
					},
				},
				'mood',
				2916284
			);

			expect( isAvailable ).toBe( false );
		} );
	} );

	describe( 'getWpcomParentThemeId', () => {
		test( 'should return null for non-existent theme', () => {
			const parentId = getWpcomParentThemeId(
				{
					themes: {
						queries: {},
					},
				},
				'blah'
			);
			expect( parentId ).toBeNull();
		} );

		test( 'should return null for theme with no parent', () => {
			const parentId = getWpcomParentThemeId(
				{
					themes: {
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { mood },
							} ),
						},
					},
				},
				'mood'
			);
			expect( parentId ).toBeNull();
		} );

		test( 'should return parent id', () => {
			const parentId = getWpcomParentThemeId(
				{
					themes: {
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { sidekick },
							} ),
						},
					},
				},
				'sidekick'
			);
			expect( parentId ).toEqual( 'superhero' );
		} );
	} );

	test( 'has managed-external theme features', () => {
		const isSiteEligible = isSiteEligibleForManagedExternalThemes(
			{
				sites: {
					features: {
						1234: {
							data: {
								active: [ FEATURE_WOOP, WPCOM_FEATURES_ATOMIC ],
							},
						},
					},
				},
			},
			1234
		);

		expect( isSiteEligible ).toEqual( true );
	} );

	test( 'does not have managed-external theme features', () => {
		const isSiteEligible = isSiteEligibleForManagedExternalThemes(
			{
				sites: {
					features: {
						1234: {
							data: {
								active: [ 'i-can-has-feature' ],
							},
						},
					},
				},
			},
			1234
		);

		expect( isSiteEligible ).toEqual( false );
	} );
} );

describe( '#getRecommendedThemes', () => {
	const themes = [ 'a', 'b', 'c' ];
	const filter = 'foobar';
	const state = {
		themes: {
			recommendedThemes: {
				[ filter ]: {
					isLoading: false,
					themes,
				},
			},
		},
	};
	test( 'should return correct themes list for filter', () => {
		const recommended = getRecommendedThemes( state, filter );
		expect( recommended ).toEqual( themes );
	} );

	test( 'should return empty themes list for unfetched filter', () => {
		const recommended = getRecommendedThemes( state, 'bazbazbaz' );
		expect( Object.keys( recommended ) ).toHaveLength( 0 );
	} );
} );

describe( '#areRecommendedThemesLoading', () => {
	const filterForIsLoading = 'foo';
	const filterForNotLoading = 'bar';
	const state = {
		themes: {
			recommendedThemes: {
				[ filterForNotLoading ]: { isLoading: false },
				[ filterForIsLoading ]: { isLoading: true },
			},
		},
	};
	test( 'should return true when loading', () => {
		expect( areRecommendedThemesLoading( state, filterForIsLoading ) ).toBe( true );
	} );

	test( 'should return false when not loading', () => {
		expect( areRecommendedThemesLoading( state, filterForNotLoading ) ).toBe( false );
	} );

	test( 'should return false when filter request not initiated', () => {
		expect( areRecommendedThemesLoading( state, 'lolol' ) ).toBe( false );
	} );
} );

describe( '#getPremiumThemePrice', () => {
	test( 'should return an empty string when a theme is not premium', () => {
		const themePrice = getPremiumThemePrice(
			{
				themes: {
					queries: {
						wpcom: new ThemeQueryManager( {
							items: { twentysixteen },
						} ),
					},
				},
			},
			'twentysixteen',
			2916284
		);

		expect( themePrice ).toEqual( '' );
	} );
	test( 'should return an empty string when a theme is already available on a given site', () => {
		const themePrice = getPremiumThemePrice(
			{
				sites: {
					plans: {
						2916284: {
							data: [
								{
									currentPlan: true,
									productSlug: PLAN_FREE,
								},
							],
						},
					},
				},
				themes: {
					queries: {
						wpcom: new ThemeQueryManager( {
							items: { mood },
						} ),
					},
				},
				purchases: {
					data: [
						{
							ID: 1234567,
							blog_id: 2916284,
							meta: 'mood',
							product_type: 'theme',
						},
					],
				},
			},
			'mood',
			2916284
		);

		expect( themePrice ).toEqual( '' );
	} );

	test( 'should return price as string when a theme is not available on a given site', () => {
		const themePrice = getPremiumThemePrice(
			{
				sites: {
					plans: {
						2916284: {
							data: [
								{
									currentPlan: true,
									productSlug: PLAN_FREE,
								},
							],
						},
					},
				},
				themes: {
					queries: {
						wpcom: new ThemeQueryManager( {
							items: { mood },
						} ),
					},
				},
				purchases: {
					data: [],
				},
			},
			'mood',
			2916284
		);

		expect( themePrice ).toEqual( '$20' );
	} );

	test( 'should return an "Upgrade" string for non-Atomic Jetpack sites', () => {
		const themePrice = getPremiumThemePrice(
			{
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							URL: 'https://example.net',
							jetpack: true,
						},
					},
					plans: {
						77203074: {
							data: [],
						},
					},
				},
				themes: {
					queries: {
						wpcom: new ThemeQueryManager( {
							items: { mood },
						} ),
					},
				},
				purchases: {
					data: [],
				},
			},
			'mood',
			77203074
		);

		expect( themePrice ).toEqual( 'Upgrade' );
	} );

	test( 'should return price as a string for free Atomic sites', () => {
		const themePrice = getPremiumThemePrice(
			{
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							URL: 'https://example.net',
							jetpack: true,
							options: {
								is_automated_transfer: true,
							},
						},
					},
					plans: {
						77203074: {
							data: [
								{
									currentPlan: true,
									productSlug: PLAN_FREE,
								},
							],
						},
					},
				},
				themes: {
					queries: {
						wpcom: new ThemeQueryManager( {
							items: { mood },
						} ),
					},
				},
				purchases: {
					data: [],
				},
			},
			'mood',
			77203074
		);

		expect( themePrice ).toEqual( '$20' );
	} );
} );

describe( '#shouldShowTryAndCustomize', () => {
	test( 'should not show Try & Customize action when user does not have permissions', () => {
		const showTryAndCustomize = shouldShowTryAndCustomize(
			{
				currentUser: {
					capabilities: {
						2916284: { edit_theme_options: false },
					},
				},
			},
			'quadrat',
			2916284
		);
		expect( showTryAndCustomize ).toBe( false );
	} );

	test( 'should not show Try & Customize when logged out', () => {
		const showTryAndCustomize = shouldShowTryAndCustomize(
			{
				currentUser: {
					id: null,
					capabilities: {},
				},
				themes: {
					queries: {},
				},
			},
			'quadrat',
			2916284
		);
		expect( showTryAndCustomize ).toBe( false );
	} );

	test( 'should not show Try & Customize for the currently active theme', () => {
		const showTryAndCustomize = shouldShowTryAndCustomize(
			{
				currentUser: {
					capabilities: {
						2916284: { edit_theme_options: true },
					},
				},
				themes: {
					queries: {},
					activeThemes: {
						2916284: 'quadrat',
					},
				},
				sites: {
					items: {},
				},
			},
			'quadrat',
			2916284
		);
		expect( showTryAndCustomize ).toBe( false );
	} );

	//Block-based themes like Quadrat should not show the Try & Customize action
	test( 'should not show Try & Customize action for new themes', () => {
		const showTryAndCustomize = shouldShowTryAndCustomize(
			{
				currentUser: {
					capabilities: {
						2916284: { edit_theme_options: true },
					},
				},
				themes: {
					queries: {
						wpcom: new ThemeQueryManager( {
							items: { quadrat },
						} ),
					},
					activeThemes: {},
				},
				sites: {
					items: {},
				},
			},
			'quadrat',
			2916284
		);
		expect( showTryAndCustomize ).toBe( false );
	} );

	//Customizer-based themes should still show Try & Customize
	test( 'should show Try & Customize action for old themes', () => {
		const showTryAndCustomize = shouldShowTryAndCustomize(
			{
				currentUser: {
					capabilities: {
						2916284: { edit_theme_options: true },
					},
				},
				themes: {
					queries: {
						wpcom: new ThemeQueryManager( {
							items: { mood },
						} ),
					},
					activeThemes: {},
				},
				sites: {
					items: {},
				},
			},
			'mood',
			2916284
		);
		expect( showTryAndCustomize ).toBe( true );
	} );

	test( 'should not show Try & Customize action for Jetpack multisite', () => {
		const showTryAndCustomize = shouldShowTryAndCustomize(
			{
				currentUser: {
					capabilities: {
						77203074: { edit_theme_options: true },
					},
				},
				themes: {
					queries: {},
				},
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							URL: 'https://example.net',
							jetpack: true,
							is_multisite: true,
						},
					},
				},
			},
			'twentynineteen',
			77203074
		);
		expect( showTryAndCustomize ).toBe( false );
	} );

	test( 'should not show Try & Customize action for premium theme unavailable to Jetpack site', () => {
		const showTryAndCustomize = shouldShowTryAndCustomize(
			{
				currentUser: {
					capabilities: {
						77203074: { edit_theme_options: true },
					},
				},
				themes: {
					queries: {
						wpcom: new ThemeQueryManager( {
							items: { mood },
						} ),
					},
				},
				purchases: {
					data: [],
				},
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							URL: 'https://example.net',
							jetpack: true,
						},
					},
					plans: {
						77203074: {
							data: [],
						},
					},
				},
			},
			'mood',
			77203074
		);
		expect( showTryAndCustomize ).toBe( false );
	} );
} );

describe( '#isExternallyManagedTheme()', () => {
	test( 'Should return true when a theme has the theme_type equals to managed-external', () => {
		const isExternallyManaged = isExternallyManagedTheme(
			{
				themes: {
					queries: {
						wpcom: new ThemeQueryManager( {
							items: {
								twentysixteen: {
									...twentysixteen,
									theme_type: 'managed-external',
								},
							},
						} ),
					},
				},
			},
			'twentysixteen'
		);

		expect( isExternallyManaged ).toEqual( true );
	} );

	test( 'Should return false when theme_type external is not present', () => {
		const isExternallyManaged = isExternallyManagedTheme(
			{
				themes: {
					queries: {
						wpcom: new ThemeQueryManager( {
							items: { twentysixteen },
						} ),
					},
				},
			},
			'twentysixteen'
		);

		expect( isExternallyManaged ).toEqual( false );
	} );

	test( 'Should return false when theme_type is different from managed-external', () => {
		const isExternallyManaged = isExternallyManagedTheme(
			{
				themes: {
					queries: {
						wpcom: new ThemeQueryManager( {
							items: {
								twentysixteen: {
									...twentysixteen,
									theme_type: 'hosted-internal',
								},
							},
						} ),
					},
				},
			},
			'twentysixteen'
		);

		expect( isExternallyManaged ).toEqual( false );
	} );

	describe( 'getIsLoadingCart', () => {
		test( 'should return true if the cart is loading', () => {
			const isLoading = getIsLoadingCart( {
				themes: {
					isLoadingCart: true,
				},
			} );
			expect( isLoading ).toBe( true );
		} );

		test( 'should return false if the cart has loaded', () => {
			const isLoading = getIsLoadingCart( {
				themes: {
					isLoadingCart: false,
				},
			} );
			expect( isLoading ).toBe( false );
		} );
	} );
} );

describe( '#getIsLivePreviewSupported()', () => {
	const baseState = {
		currentUser: {
			id: 1234,
		},
		themes: {
			activeThemes: {
				2916284: 'twentysixteen',
			},
			queries: {
				[ 2916284 ]: new ThemeQueryManager( {
					items: { pendant },
				} ),
			},
		},
		sites: {
			items: {
				2916284: {
					jetpack: true,
				},
			},
			features: {
				2916284: {
					data: {
						active: [ FEATURE_WOOP, WPCOM_FEATURES_ATOMIC ],
					},
				},
			},
		},
	};
	test( 'should return false if the user is NOT logged in', () => {
		const isLivePreviewSupported = getIsLivePreviewSupported(
			{
				currentUser: {
					id: null,
				},
			},
			'twentysixteen',
			2916284
		);
		expect( isLivePreviewSupported ).toBe( false );
	} );
	test( 'should return false if the theme is the active theme', () => {
		const isLivePreviewSupported = getIsLivePreviewSupported(
			{
				...baseState,
				themes: {
					activeThemes: {
						2916284: 'twentysixteen',
					},
				},
			},
			'twentysixteen',
			2916284
		);
		expect( isLivePreviewSupported ).toBe( false );
	} );
	test( 'should return false if the theme is not Full Site Editing compatible', () => {
		const isLivePreviewSupported = getIsLivePreviewSupported(
			{
				...baseState,
				themes: {
					...baseState.themes,
					queries: {
						[ 2916284 ]: new ThemeQueryManager( {
							items: { twentyfifteen },
						} ),
					},
				},
			},
			'twentyfifteen',
			2916284
		);
		expect( isLivePreviewSupported ).toBe( false );
	} );
	test( 'should return false if the theme is listed in the un-compatible themes', () => {
		const isLivePreviewSupported = getIsLivePreviewSupported(
			{
				...baseState,
				themes: {
					...baseState.themes,
					queries: {
						[ 2916284 ]: new ThemeQueryManager( {
							items: { appleton },
						} ),
					},
				},
			},
			'appleton',
			2916284
		);
		expect( isLivePreviewSupported ).toBe( false );
	} );
	describe( 'Externally managed themes', () => {
		test( 'should return true if the user is subscribed to the theme AND the site is eligible for managed external themes', () => {
			const isLivePreviewSupported = getIsLivePreviewSupported(
				{
					...baseState,
					themes: {
						...baseState.themes,
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { nokul },
							} ),
						},
					},
					purchases: {
						data: [
							{
								blog_id: 2916284,
								product_slug: 'wp_mp_theme_nokul_monthly',
							},
						],
					},
					productsList: {
						items: {
							wp_mp_theme_nokul_monthly: {
								product_slug: 'wp_mp_theme_nokul_monthly',
								billing_product_slug: 'wp-mp-theme-nokul',
							},
						},
					},
				},
				'nokul',
				2916284
			);
			expect( isLivePreviewSupported ).toBeTruthy();
		} );
		test( 'should return false on Simple sites even if the user is still subscribed to the theme', () => {
			const isLivePreviewSupported = getIsLivePreviewSupported(
				{
					...baseState,
					purchases: {
						data: [
							{
								blog_id: 2916284,
								product_slug: 'wp_mp_theme_nokul_monthly',
							},
						],
					},
					productsList: {
						items: {
							wp_mp_theme_nokul_monthly: {
								product_slug: 'wp_mp_theme_nokul_monthly',
								billing_product_slug: 'wp-mp-theme-nokul',
							},
						},
					},
					sites: {
						items: {
							2916284: {
								// Simple site
								jetpack: false,
							},
						},
					},
				},
				'nokul',
				2916284
			);
			expect( isLivePreviewSupported ).toBeFalsy();
		} );
	} );
	describe( 'on Atomic sites', () => {
		test( 'should return true even if the theme is NOT installed', () => {
			const isLivePreviewSupported = getIsLivePreviewSupported(
				{
					...baseState,
					themes: {
						...baseState.themes,
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { pendant },
							} ),
						},
					},
				},
				'pendant',
				2916284
			);
			expect( isLivePreviewSupported ).toBe( true );
		} );
		test( 'should return true if the theme supports live preview', () => {
			const isLivePreviewSupported = getIsLivePreviewSupported( baseState, 'pendant', 2916284 );
			expect( isLivePreviewSupported ).toBe( true );
		} );
	} );
} );

describe( '#getThemeTiers', () => {
	test( 'should return an empty object if the state is empty', () => {
		const themeTiers = getThemeTiers( {} );
		expect( themeTiers ).toEqual( {} );
	} );
	test( 'should return the tier object if it exists', () => {
		const themeTiers = getThemeTiers( { themes: { themeFilters: { tier: { free: {} } } } } );
		expect( themeTiers ).toEqual( { free: {} } );
	} );
} );
describe( '#getThemeTier', () => {
	test( 'should return an empty object if the state is empty', () => {
		const themeTier = getThemeTier( {}, 'free' );
		expect( themeTier ).toEqual( {} );
	} );
	const state = { themes: { themeFilters: { tier: { free: { foo: 'bar' } } } } };
	test( 'should return an empty object if the tier is empty', () => {
		const themeTier = getThemeTier( state, null );
		expect( themeTier ).toEqual( {} );
	} );
	test( 'should return the tier object if it exists', () => {
		const themeTier = getThemeTier( state, 'free' );
		expect( themeTier ).toEqual( { foo: 'bar' } );
	} );
} );
describe( '#getThemeTierForTheme', () => {
	test( 'should return an empty object if the theme is not found', () => {
		const state = {
			themes: {
				queries: {
					wpcom: null,
				},
			},
		};
		const themeTiers = getThemeTierForTheme( state, 'twentysixteen' );
		expect( themeTiers ).toEqual( {} );
	} );
	test( 'should return the tier object if it exists', () => {
		const state = {
			themes: {
				queries: {
					wpcom: new ThemeQueryManager( {
						items: { twentysixteen },
					} ),
				},
			},
		};
		const themeTiers = getThemeTierForTheme( state, 'twentysixteen' );
		expect( themeTiers ).toEqual( freeThemeTier );
	} );
} );
