/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer, {
	queryRequests,
	queryRequestErrors,
	queries,
	lastQuery,
	themeRequests,
	themeRequestErrors,
	activeThemes,
	activationRequests,
	activeThemeRequests,
	themeInstalls,
	completedActivationRequests,
	recommendedThemes,
} from '../reducer';
import ThemeQueryManager from 'calypso/lib/query-manager/theme';
import {
	THEME_REQUEST,
	THEME_REQUEST_SUCCESS,
	THEME_REQUEST_FAILURE,
	THEMES_REQUEST,
	THEMES_REQUEST_FAILURE,
	THEMES_REQUEST_SUCCESS,
	ACTIVE_THEME_REQUEST,
	ACTIVE_THEME_REQUEST_SUCCESS,
	ACTIVE_THEME_REQUEST_FAILURE,
	THEME_ACTIVATE,
	THEME_ACTIVATE_SUCCESS,
	THEME_ACTIVATE_FAILURE,
	THEME_CLEAR_ACTIVATED,
	THEME_INSTALL,
	THEME_INSTALL_SUCCESS,
	THEME_INSTALL_FAILURE,
	RECOMMENDED_THEMES_FETCH,
	RECOMMENDED_THEMES_SUCCESS,
	RECOMMENDED_THEMES_FAIL,
} from 'calypso/state/themes/action-types';
import { SERIALIZE, DESERIALIZE } from 'calypso/state/action-types';

const twentysixteen = {
	id: 'twentysixteen',
	name: 'Twenty Sixteen',
	author: 'the WordPress team',
	screenshot:
		'https://i0.wp.com/theme.wordpress.com/wp-content/themes/pub/twentysixteen/screenshot.png',
	stylesheet: 'pub/twentysixteen',
	demo_uri: 'https://twentysixteendemo.wordpress.com/',
	author_uri: 'https://wordpress.org/',
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

describe( 'reducer', () => {
	beforeEach( jest.restoreAllMocks );

	test( 'should include expected keys in return value', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual(
			expect.arrayContaining( [
				'activationRequests',
				'activeThemeRequests',
				'activeThemes',
				'completedActivationRequests',
				'lastQuery',
				'queries',
				'queryRequestErrors',
				'queryRequests',
				'themeFilters',
				'themeInstalls',
				'themePreviewOptions',
				'themePreviewVisibility',
				'themeRequestErrors',
				'themeRequests',
				'themesUI',
				'uploadTheme',
				'recommendedThemes',
			] )
		);
	} );

	describe( '#queryRequests()', () => {
		test( 'should default to an empty object', () => {
			const state = queryRequests( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		// TODO: Delete test? no site-specific search?
		test( 'should track theme query request fetching', () => {
			const state = queryRequests( deepFreeze( {} ), {
				type: THEMES_REQUEST,
				siteId: 2916284,
				query: { search: 'Hello' },
			} );

			expect( state ).toEqual( {
				'2916284:{"search":"Hello"}': true,
			} );
		} );

		test( 'should track theme queries without specified site', () => {
			const state = queryRequests( deepFreeze( {} ), {
				type: THEMES_REQUEST,
				query: { search: 'Hello' },
			} );

			expect( state ).toEqual( {
				'{"search":"Hello"}': true,
			} );
		} );

		test( 'should accumulate queries', () => {
			const original = deepFreeze( {
				'2916284:{"search":"Hello"}': true,
			} );

			const state = queryRequests( original, {
				type: THEMES_REQUEST,
				siteId: 2916284,
				query: { search: 'Hello W' },
			} );

			expect( state ).toEqual( {
				'2916284:{"search":"Hello"}': true,
				'2916284:{"search":"Hello W"}': true,
			} );
		} );

		test( 'should track theme query request success', () => {
			const state = queryRequests( deepFreeze( {} ), {
				type: THEMES_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: 'Mood' },
				found: 1,
				themes: [ mood ],
			} );

			expect( state ).toEqual( {
				'2916284:{"search":"Mood"}': false,
			} );
		} );

		test( 'should track theme query request failure', () => {
			const state = queryRequests( deepFreeze( {} ), {
				type: THEMES_REQUEST_FAILURE,
				siteId: 2916284,
				query: { search: 'Hello' },
				error: new Error(),
			} );

			expect( state ).toEqual( {
				'2916284:{"search":"Hello"}': false,
			} );
		} );
	} );

	describe( '#queryRequestErrors()', () => {
		test( 'should default to an empty object', () => {
			const state = queryRequestErrors( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should create empty mapping on success if previous state was empty', () => {
			const state = queryRequestErrors( deepFreeze( {} ), {
				type: THEMES_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: 'Twenty' },
			} );

			expect( state ).toEqual( {
				2916284: {},
			} );
		} );

		test( 'should map site ID, query to error if request finishes with failure', () => {
			const state = queryRequestErrors( deepFreeze( {} ), {
				type: THEMES_REQUEST_FAILURE,
				siteId: 2916284,
				query: { search: 'Twenty' },
				error: 'Request error',
			} );

			expect( state ).toEqual( {
				2916284: {
					'2916284:{"search":"Twenty"}': 'Request error',
				},
			} );
		} );

		test( 'should reset error state after successful request after a failure', () => {
			const state = queryRequestErrors(
				deepFreeze( {
					2916284: {
						'2916284:{"search":"Twenty"}': 'Request Error',
					},
				} ),
				{
					type: THEMES_REQUEST_SUCCESS,
					siteId: 2916284,
					query: { search: 'Twenty' },
				}
			);

			expect( state ).toEqual( {
				2916284: {},
			} );
		} );

		test( 'should accumulate mappings', () => {
			const state = queryRequestErrors(
				deepFreeze( {
					2916284: {
						'2916284:{"blerch":"Twenty"}': 'Invalid query!',
					},
				} ),
				{
					type: THEMES_REQUEST_FAILURE,
					siteId: 2916284,
					query: { search: 'Twenty' },
					error: 'System error',
				}
			);

			expect( state ).toEqual( {
				2916284: {
					'2916284:{"blerch":"Twenty"}': 'Invalid query!',
					'2916284:{"search":"Twenty"}': 'System error',
				},
			} );
		} );
	} );

	describe( '#queries()', () => {
		test( 'should default to an empty object', () => {
			const state = queries( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should track theme query request success', () => {
			const state = queries( deepFreeze( {} ), {
				type: THEMES_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: 'Mood' },
				found: 1,
				themes: [ mood ],
			} );

			expect( state ).toHaveProperty( '2916284' );
			expect( state[ 2916284 ] ).toBeInstanceOf( ThemeQueryManager );
			expect( state[ 2916284 ].getItems( { search: 'Mood' } ) ).toEqual( [ mood ] );
		} );

		test( 'should accumulate query request success', () => {
			const original = deepFreeze(
				queries( deepFreeze( {} ), {
					type: THEMES_REQUEST_SUCCESS,
					siteId: 2916284,
					query: { search: 'Twenty' },
					found: 1,
					themes: [ twentysixteen ],
				} )
			);

			const state = queries( original, {
				type: THEMES_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: 'Twenty Six' },
				themes: [ twentysixteen ],
			} );

			expect( state ).toHaveProperty( '2916284' );
			expect( state[ 2916284 ] ).toBeInstanceOf( ThemeQueryManager );
			expect( state[ 2916284 ].getItems( { search: 'Twenty' } ) ).toHaveLength( 1 );
			expect( state[ 2916284 ].getItems( { search: 'Twenty Six' } ) ).toHaveLength( 1 );
		} );

		test( 'should return the same state if successful request has no changes', () => {
			const action = {
				type: THEMES_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: 'Twenty' },
				found: 1,
				themes: [ twentysixteen ],
			};
			const original = deepFreeze( queries( deepFreeze( {} ), action ) );
			const state = queries( original, action );

			expect( state ).toBe( original );
		} );

		test( 'should persist state', () => {
			const original = deepFreeze(
				queries( deepFreeze( {} ), {
					type: THEMES_REQUEST_SUCCESS,
					siteId: 2916284,
					query: { search: 'Sixteen' },
					found: 1,
					themes: [ twentysixteen ],
				} )
			);

			const state = queries( original, { type: SERIALIZE } );

			// _timestamp is not part of the data
			delete state._timestamp;

			expect( state ).toEqual( {
				2916284: {
					data: {
						items: {
							twentysixteen,
						},
						queries: {
							'[["search","Sixteen"]]': {
								itemKeys: [ 'twentysixteen' ],
								found: 1,
							},
						},
					},
					options: {
						itemKey: 'id',
					},
				},
			} );
		} );

		test( 'should load valid persisted state', () => {
			const original = deepFreeze( {
				2916284: {
					data: {
						items: {
							twentysixteen,
						},
						queries: {
							'[["search","Sixteen"]]': {
								itemKeys: [ 'twentysixteen' ],
								found: 1,
							},
						},
					},
					options: {
						itemKey: 'id',
					},
				},
			} );

			const state = queries( original, { type: DESERIALIZE } );

			expect( state ).toEqual( {
				2916284: new ThemeQueryManager(
					{
						items: {
							twentysixteen,
						},
						queries: {
							'[["search","Sixteen"]]': {
								found: 1,
								itemKeys: [ 'twentysixteen' ],
							},
						},
					},
					{ itemKey: 'id' }
				),
			} );
		} );

		test( 'should not load invalid persisted state', () => {
			jest.spyOn( console, 'warn' ).mockImplementation( () => {} );
			const original = deepFreeze( {
				2916284: '{INVALID',
			} );

			const state = queries( original, { type: DESERIALIZE } );

			expect( state ).toEqual( {} );
		} );
	} );

	describe( '#lastQuery()', () => {
		test( 'should default to an empty object', () => {
			const state = lastQuery( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should store last query', () => {
			const state = lastQuery( deepFreeze( {} ), {
				type: THEMES_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: 'Sixteen' },
			} );

			expect( state ).toHaveProperty( '2916284' );
			expect( state ).toEqual( {
				2916284: {
					search: 'Sixteen',
				},
			} );
		} );

		test( 'should overwrite last query with new query', () => {
			const state = lastQuery(
				deepFreeze( {
					2916284: {
						search: 'Sixteen',
					},
				} ),
				{
					type: THEMES_REQUEST_SUCCESS,
					siteId: 2916284,
					query: { search: 'orange color' },
				}
			);

			expect( state ).toHaveProperty( '2916284' );
			expect( state ).toEqual( {
				2916284: {
					search: 'orange color',
				},
			} );
		} );
	} );

	describe( '#themeRequests()', () => {
		test( 'should default to an empty object', () => {
			const state = themeRequests( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should map site ID, theme ID to true value if request in progress', () => {
			const state = themeRequests( deepFreeze( {} ), {
				type: THEME_REQUEST,
				siteId: 2916284,
				themeId: 841,
			} );

			expect( state ).toEqual( {
				2916284: {
					841: true,
				},
			} );
		} );

		test( 'should accumulate mappings', () => {
			const state = themeRequests(
				deepFreeze( {
					2916284: {
						841: true,
					},
				} ),
				{
					type: THEME_REQUEST,
					siteId: 2916284,
					themeId: 413,
				}
			);

			expect( state ).toEqual( {
				2916284: {
					841: true,
					413: true,
				},
			} );
		} );

		test( 'should map site ID, theme ID to false value if request finishes successfully', () => {
			const state = themeRequests(
				deepFreeze( {
					2916284: {
						841: true,
					},
				} ),
				{
					type: THEME_REQUEST_SUCCESS,
					siteId: 2916284,
					themeId: 841,
				}
			);

			expect( state ).toEqual( {
				2916284: {
					841: false,
				},
			} );
		} );

		test( 'should map site ID, theme ID to false value if request finishes with failure', () => {
			const state = themeRequests(
				deepFreeze( {
					2916284: {
						841: true,
					},
				} ),
				{
					type: THEME_REQUEST_FAILURE,
					siteId: 2916284,
					themeId: 841,
				}
			);

			expect( state ).toEqual( {
				2916284: {
					841: false,
				},
			} );
		} );
	} );

	describe( '#themeRequestErrors()', () => {
		const themeError = deepFreeze( {
			wpcom: {
				blah: {
					path: '\rest\v1.2\themes\blah',
					method: 'GET',
					name: 'ThemeNotFoundError',
					statusCode: 404,
					status: 404,
					message: 'The specified theme was not found',
					error: 'theme_not_found',
				},
			},
		} );

		test( 'should default to an empty object', () => {
			const state = themeRequestErrors( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should create empyt mapping on success if previous state was empty', () => {
			const state = themeRequestErrors( deepFreeze( {} ), {
				type: THEME_REQUEST_SUCCESS,
				siteId: 2916284,
				themeId: 'twentysixteen',
			} );

			expect( state ).toEqual( {
				2916284: {},
			} );
		} );

		test( 'should map site ID, theme ID to error if request finishes with failure', () => {
			const state = themeRequestErrors( deepFreeze( {} ), {
				type: THEME_REQUEST_FAILURE,
				siteId: 2916284,
				themeId: 'vivaro',
				error: 'Request error',
			} );

			expect( state ).toEqual( {
				2916284: {
					vivaro: 'Request error',
				},
			} );
		} );

		test( 'should switch from error to no mapping after successful request after a failure', () => {
			const state = themeRequestErrors(
				deepFreeze( {
					2916284: {
						pinboard: 'Request Error',
					},
				} ),
				{
					type: THEME_REQUEST_SUCCESS,
					siteId: 2916284,
					themeId: 'pinboard',
				}
			);

			expect( state ).toEqual( {
				2916284: {},
			} );
		} );

		test( 'should accumulate mappings', () => {
			const state = themeRequestErrors(
				deepFreeze( {
					2916284: {
						twentysixteennnnn: 'No such theme!',
					},
				} ),
				{
					type: THEME_REQUEST_FAILURE,
					siteId: 2916284,
					themeId: 'twentysixteen',
					error: 'System error',
				}
			);

			expect( state ).toEqual( {
				2916284: {
					twentysixteennnnn: 'No such theme!',
					twentysixteen: 'System error',
				},
			} );
		} );

		test( 'persists state', () => {
			const state = themeRequestErrors( themeError, {
				type: SERIALIZE,
			} );

			expect( state ).toEqual( themeError );
		} );

		test( 'loads persisted state', () => {
			const state = themeRequestErrors( themeError, {
				type: DESERIALIZE,
			} );

			expect( state ).toEqual( themeError );
		} );
	} );

	describe( '#activeThemes()', () => {
		test( 'should default to an empty object', () => {
			const state = activeThemes( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should track active theme request success', () => {
			const state = activeThemes( deepFreeze( {} ), {
				type: ACTIVE_THEME_REQUEST_SUCCESS,
				siteId: 2211667,
				theme: {
					id: 'rebalance',
					name: 'Rebalance',
					cost: {
						currency: 'USD',
						number: 0,
						display: '',
					},
				},
			} );

			expect( state ).toHaveProperty( '2211667' );
			expect( state ).toEqual( { 2211667: 'rebalance' } );
		} );

		test( 'should track active theme request success and overwrite old theme', () => {
			const state = activeThemes( deepFreeze( { 2211667: 'rebalance' } ), {
				type: ACTIVE_THEME_REQUEST_SUCCESS,
				siteId: 2211667,
				theme: {
					id: 'twentysixteen',
					name: 'Twenty Sixteen',
					cost: {
						currency: 'USD',
						number: 0,
						display: '',
					},
				},
			} );

			expect( state ).toHaveProperty( '2211667' );
			expect( state ).toEqual( { 2211667: 'twentysixteen' } );
		} );

		test( 'should track theme activate request success', () => {
			const state = activeThemes( deepFreeze( {} ), {
				type: THEME_ACTIVATE_SUCCESS,
				themeStylesheet: 'twentysixteen',
				siteId: 2211888,
			} );

			expect( state ).toHaveProperty( '2211888' );
			expect( state ).toEqual( { 2211888: 'twentysixteen' } );
		} );

		test( 'should persist state', () => {
			const state = activeThemes( { 2211888: 'twentysixteen' }, { type: SERIALIZE } );

			expect( state ).toEqual( { 2211888: 'twentysixteen' } );
		} );

		test( 'should load valid persisted state', () => {
			const original = deepFreeze( {
				2211888: 'twentysixteen',
			} );

			const state = activeThemes( original, { type: DESERIALIZE } );
			expect( state ).toEqual( { 2211888: 'twentysixteen' } );
		} );

		test( 'should not load invalid persisted state', () => {
			jest.spyOn( console, 'warn' ).mockImplementation( () => {} );
			const original = deepFreeze( {
				2916284: 1234,
			} );

			const state = activeThemes( original, { type: DESERIALIZE } );
			expect( state ).toEqual( {} );
		} );
	} );

	describe( '#activationRequests', () => {
		test( 'should default to an empty object', () => {
			const state = activationRequests( undefined, {} );
			expect( state ).toEqual( {} );
		} );

		test( 'should map site ID to true value if request in progress', () => {
			const state = activationRequests( deepFreeze( {} ), {
				type: THEME_ACTIVATE,
				siteId: 2916284,
			} );

			expect( state ).toEqual( {
				2916284: true,
			} );
		} );

		test( 'should accumulate mappings', () => {
			const state = activationRequests(
				deepFreeze( {
					2916284: true,
				} ),
				{
					type: THEME_ACTIVATE,
					siteId: 2916285,
				}
			);

			expect( state ).toEqual( {
				2916284: true,
				2916285: true,
			} );
		} );

		test( 'should map site ID to false value if request finishes successfully', () => {
			const state = activationRequests(
				deepFreeze( {
					2916284: true,
				} ),
				{
					type: THEME_ACTIVATE_SUCCESS,
					siteId: 2916284,
					themeStylesheet: 'twentysixteen',
				}
			);

			expect( state ).toEqual( {
				2916284: false,
			} );
		} );

		test( 'should map site ID to false value if request finishes with failure', () => {
			const state = activationRequests(
				deepFreeze( {
					2916284: true,
				} ),
				{
					type: THEME_ACTIVATE_FAILURE,
					siteId: 2916284,
					themeId: 'twentysixteen',
					error: 'Unknown blog',
				}
			);

			expect( state ).toEqual( {
				2916284: false,
			} );
		} );
	} );

	describe( '#themeInstalls()', () => {
		test( 'should default to an empty object', () => {
			const state = themeInstalls( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should map site ID, theme ID to true value if request in progress', () => {
			const state = themeInstalls( deepFreeze( {} ), {
				type: THEME_INSTALL,
				siteId: 2211667,
				themeId: 'karuna',
			} );

			expect( state ).toEqual( {
				2211667: {
					karuna: true,
				},
			} );
		} );

		test( 'should accumulate mappings', () => {
			const state = themeInstalls(
				deepFreeze( {
					2211667: {
						karuna: true,
					},
				} ),
				{
					type: THEME_INSTALL,
					siteId: 'anothersitewithjetpack.com',
					themeId: 'pinboard',
				}
			);

			expect( state ).toEqual( {
				2211667: {
					karuna: true,
				},
				'anothersitewithjetpack.com': {
					pinboard: true,
				},
			} );
		} );

		test( 'should map site ID, theme ID to false value if request finishes successfully', () => {
			const state = themeInstalls(
				deepFreeze( {
					2211667: {
						karuna: true,
					},
				} ),
				{
					type: THEME_INSTALL_SUCCESS,
					siteId: 2211667,
					themeId: 'karuna',
				}
			);

			expect( state ).toEqual( {
				2211667: {
					karuna: false,
				},
			} );
		} );

		test( 'should map site ID, theme ID to false value if request finishes with failure', () => {
			const state = themeInstalls(
				deepFreeze( {
					2211667: {
						karuna: true,
					},
				} ),
				{
					type: THEME_INSTALL_FAILURE,
					siteId: 2211667,
					themeId: 'karuna',
					error: { message: 'The theme is already installed' },
				}
			);

			expect( state ).toEqual( {
				2211667: {
					karuna: false,
				},
			} );
		} );
	} );

	describe( '#completedActivationRequests()', () => {
		test( 'should default to an empty object', () => {
			const state = completedActivationRequests( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should track theme activate request success', () => {
			const state = completedActivationRequests( deepFreeze( {} ), {
				type: THEME_ACTIVATE_SUCCESS,
				siteId: 2211667,
			} );

			expect( state ).toHaveProperty( '2211667' );
			expect( state ).toEqual( { 2211667: true } );
		} );

		test( 'should track theme clear activated', () => {
			const state = completedActivationRequests( deepFreeze( { 2211667: true } ), {
				type: THEME_CLEAR_ACTIVATED,
				siteId: 2211667,
			} );

			expect( state ).toHaveProperty( '2211667' );
			expect( state ).toEqual( { 2211667: false } );
		} );
	} );

	describe( '#activeThemeRequests', () => {
		test( 'should default to an empty object', () => {
			const state = activeThemeRequests( undefined, {} );
			expect( state ).toEqual( {} );
		} );

		test( 'should map site ID to true value if request in progress', () => {
			const state = activeThemeRequests( deepFreeze( {} ), {
				type: ACTIVE_THEME_REQUEST,
				siteId: 2916284,
			} );

			expect( state ).toEqual( {
				2916284: true,
			} );
		} );

		test( 'should accumulate mappings', () => {
			const state = activeThemeRequests(
				deepFreeze( {
					2916284: true,
				} ),
				{
					type: ACTIVE_THEME_REQUEST,
					siteId: 2916285,
				}
			);

			expect( state ).toEqual( {
				2916284: true,
				2916285: true,
			} );
		} );

		test( 'should map site ID to false value if request finishes successfully', () => {
			const state = activeThemeRequests(
				deepFreeze( {
					2916284: true,
				} ),
				{
					type: ACTIVE_THEME_REQUEST_SUCCESS,
					siteId: 2916284,
					themeId: 'twentysixteen',
				}
			);

			expect( state ).toEqual( {
				2916284: false,
			} );
		} );

		test( 'should map site ID to false value if request finishes with failure', () => {
			const state = activeThemeRequests(
				deepFreeze( {
					2916284: true,
				} ),
				{
					type: ACTIVE_THEME_REQUEST_FAILURE,
					siteId: 2916284,
					error: 'Unknown blog',
				}
			);

			expect( state ).toEqual( {
				2916284: false,
			} );
		} );
	} );

	describe( '#recommendedThemes()', () => {
		test( 'should default to isLoading and empty themes array', () => {
			const state = recommendedThemes( undefined, {} );
			expect( state ).toEqual( { isLoading: true, themes: [] } );
		} );

		test( 'should update isLoading when fetch is called', () => {
			const state = recommendedThemes(
				{ isLoading: false, themes: [] },
				{
					type: RECOMMENDED_THEMES_FETCH,
				}
			);
			expect( state ).toEqual( { isLoading: true, themes: [] } );
		} );

		test( 'should update isLoading and themes on fetch success', () => {
			const state = recommendedThemes(
				{ isLoading: true, themes: [] },
				{
					type: RECOMMENDED_THEMES_SUCCESS,
					payload: {
						themes: [ 'a', 'b', 'c' ],
					},
				}
			);
			expect( state ).toEqual( {
				isLoading: false,
				themes: [ 'a', 'b', 'c' ],
			} );
		} );

		test( 'should update isLoading on fetch fail', () => {
			const state = recommendedThemes(
				{ isLoading: true, themes: [] },
				{
					type: RECOMMENDED_THEMES_FAIL,
				}
			);
			expect( state ).toEqual( { isLoading: false, themes: [] } );
		} );
	} );
} );
