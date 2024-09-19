// Importing `jest-fetch-mock` adds a jest-friendly `fetch` polyfill to the global scope.
import 'jest-fetch-mock';
import ThemeQueryManager from 'calypso/lib/query-manager/theme';
import {
	ACTIVE_THEME_REQUEST,
	ACTIVE_THEME_REQUEST_SUCCESS,
	ACTIVE_THEME_REQUEST_FAILURE,
	RECOMMENDED_THEMES_FETCH,
	RECOMMENDED_THEMES_SUCCESS,
	THEME_ACTIVATE,
	THEME_ACTIVATE_SUCCESS,
	THEME_ACTIVATE_FAILURE,
	THEME_CLEAR_ACTIVATED,
	THEME_DELETE_SUCCESS,
	THEME_DELETE_FAILURE,
	THEME_FILTERS_REQUEST,
	THEME_INSTALL,
	THEME_INSTALL_SUCCESS,
	THEME_INSTALL_FAILURE,
	THEME_REQUEST,
	THEME_REQUEST_SUCCESS,
	THEME_REQUEST_FAILURE,
	THEME_TRANSFER_INITIATE_FAILURE,
	THEME_TRANSFER_INITIATE_REQUEST,
	THEME_TRANSFER_INITIATE_SUCCESS,
	THEME_TRANSFER_STATUS_FAILURE,
	THEME_TRANSFER_STATUS_RECEIVE,
	THEMES_REQUEST,
	THEMES_REQUEST_SUCCESS,
	THEMES_REQUEST_FAILURE,
	THEMES_UPDATE,
	THEMES_UPDATE_FAILURE,
	THEMES_UPDATE_SUCCESS,
} from 'calypso/state/themes/action-types';
import useNock from 'calypso/test-helpers/use-nock';
import { ADMIN_MENU_REQUEST } from '../../action-types';
import {
	themeActivated,
	clearActivated,
	activateTheme,
	installAndActivateTheme,
	activate,
	requestActiveTheme,
	receiveTheme,
	receiveThemes,
	requestThemes,
	requestTheme,
	requestThemeOnAtomic,
	pollThemeTransferStatus,
	initiateThemeTransfer,
	installTheme,
	installAndTryAndCustomizeTheme,
	tryAndCustomizeTheme,
	tryAndCustomize,
	deleteTheme,
	requestThemeFilters,
	getRecommendedThemes,
	receiveRecommendedThemes,
	updateThemes,
	addExternalManagedThemeToCart,
	livePreview,
	redirectToLivePreview,
} from '../actions';
import { themesUpdated } from '../actions/theme-update';

jest.mock( '@automattic/calypso-config', () => {
	const mock = () => 'development';
	mock.isEnabled = jest.fn( ( flag ) => {
		const allowedFlags = [];
		if ( allowedFlags.includes( flag ) ) {
			return true;
		}
		return false;
	} );
	return mock;
} );

expect.extend( {
	toMatchFunction( received, fn ) {
		if ( received.toString() === fn.toString() ) {
			return {
				message: () => 'Expected functions to match.',
				pass: true,
			};
		}

		return {
			message: () => 'Expected functions to not match.',
			pass: false,
		};
	},
	toBeTruthy( received ) {
		if ( received ) {
			return {
				message: () => 'Expected value to be truthy.',
				pass: true,
			};
		}

		return {
			message: () => 'Expected value to not be truthy.',
			pass: false,
		};
	},
} );

describe( 'actions', () => {
	let spy;
	beforeEach( () => {
		spy = jest.fn();
	} );

	describe( '#receiveTheme()', () => {
		const getState = () => ( {
			themes: {
				queries: {
					wpcom: new ThemeQueryManager(),
				},
			},
			sites: {
				items: {},
			},
		} );

		test( 'should dispatch THEMES_REQUEST_SUCCESS action', () => {
			const theme = { id: 'twentysixteen', name: 'Twenty Sixteen' };
			receiveTheme( theme, 'wpcom' )( spy, getState );

			expect( spy ).toHaveBeenCalledWith( {
				type: THEMES_REQUEST_SUCCESS,
				themes: [ { id: 'twentysixteen', name: 'Twenty Sixteen' } ],
				siteId: 'wpcom',
				query: undefined,
				found: undefined,
			} );
		} );
	} );

	describe( '#receiveThemes()', () => {
		const getState = () => ( {
			themes: {
				queries: {
					wpcom: new ThemeQueryManager(),
				},
			},
			sites: {
				items: {
					77203074: {
						jetpack: true,
						options: { jetpack_version: '4.7' },
					},
				},
			},
		} );

		describe( 'with a wpcom site', () => {
			const themes = [
				{ id: 'twentysixteen', name: 'Twenty Sixteen' },
				{ id: 'mood', name: 'Mood' },
			];
			const query = { search: 'Automattic' };

			test( 'should dispatch themes request success action', () => {
				receiveThemes( themes, 'wpcom', query, 4 )( spy, getState );
				expect( spy ).toHaveBeenCalledWith( {
					type: THEMES_REQUEST_SUCCESS,
					siteId: 'wpcom',
					query,
					found: 4,
					themes,
				} );
			} );
		} );

		describe( 'with a Jetpack site', () => {
			const themes = [
				{ id: 'twentysixteen', name: 'Twenty Sixteen' },
				{ id: 'mood', name: 'Mood' },
			];

			test( 'should dispatch themes request success action', () => {
				receiveThemes( themes, 77203074, {} )( spy, getState );
				expect( spy ).toHaveBeenCalledWith( {
					type: THEMES_REQUEST_SUCCESS,
					siteId: 77203074,
					query: {},
					found: 2,
					themes,
				} );
			} );
		} );
	} );

	describe( '#requestThemes()', () => {
		const getState = () => ( {
			themes: {
				queries: {
					wpcom: new ThemeQueryManager(),
				},
			},
			sites: {
				items: {},
			},
			productsList: {
				items: {},
			},
			purchases: {
				data: {},
			},
		} );

		describe( 'with a wpcom site', () => {
			let nockScope;
			useNock( ( nock ) => {
				const url = '/rest/v1.2/themes?include_blankcanvas_theme=';
				nockScope = nock( 'https://public-api.wordpress.com:443' )
					.get( url )
					.reply( 200, {
						found: 2,
						themes: [
							{ ID: 'twentysixteen', name: 'Twenty Sixteen' },
							{ ID: 'mood', name: 'Mood' },
						],
					} );
			} );

			test( 'should dispatch fetch action when thunk triggered', async () => {
				await requestThemes( 'wpcom' )( spy, getState );

				expect( spy ).toHaveBeenCalledWith( {
					type: THEMES_REQUEST,
					siteId: 'wpcom',
					query: {},
				} );
				expect( nockScope.isDone() ).toBe( true );
			} );
		} );

		describe( 'with a Jetpack site', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.get( '/rest/v1/sites/77203074/themes' )
					.reply( 200, {
						// The endpoint doesn't return `found` for Jetpack sites
						themes: [
							{ ID: 'twentyfifteen', name: 'Twenty Fifteen' },
							{ ID: 'twentysixteen', name: 'Twenty Sixteen' },
						],
					} )
					.get( '/rest/v1/sites/1916284/themes' )
					.reply( 403, {
						error: 'authorization_required',
						message: 'User cannot access this private blog.',
					} );
			} );

			test( 'should dispatch fetch action when thunk triggered', () => {
				requestThemes( 77203074 )( spy, getState );

				expect( spy ).toHaveBeenCalledWith( {
					type: THEMES_REQUEST,
					siteId: 77203074,
					query: {},
				} );
			} );

			test( 'should dispatch fail action when request fails', () => {
				const jetpackGetState = () => ( {
					themes: {
						queries: {
							wpcom: new ThemeQueryManager(),
						},
					},
					sites: {
						items: {
							1916284: {
								options: { is_wpcom_atomic: false, jetpack_connection_active_plugins: [ 'foo' ] },
							},
						},
					},
					productsList: {
						items: {},
					},
					purchases: {
						data: {},
					},
				} );

				return requestThemes( 1916284 )( spy, jetpackGetState ).then( () => {
					expect( spy ).toHaveBeenCalledWith( {
						type: THEMES_REQUEST_FAILURE,
						siteId: 1916284,
						query: {},
						error: expect.objectContaining( { message: 'User cannot access this private blog.' } ),
					} );
				} );
			} );
		} );

		describe( 'with the WP.org API', () => {
			useNock( ( nock ) => {
				nock( 'https://api.wordpress.org' )
					.persist()
					.defaultReplyHeaders( {
						'Content-Type': 'application/json',
					} )
					.get(
						'/themes/info/1.1/?action=query_themes&request%5Bfields%5D%5Bextended_author%5D=true'
					)
					.reply( 200, {
						info: { page: 1, pages: 123, results: 2452 },
						themes: [
							{ slug: 'bizprime', name: 'bizprime' },
							{ slug: 'shapely', name: 'Shapely' },
							{ slug: 'cassions', name: 'Cassions' },
							{ slug: 'intentionally-blank', name: 'Intentionally Blank' },
						],
					} );
			} );

			test( 'should dispatch fetch action when thunk triggered', () => {
				requestThemes( 'wporg' )( spy, getState );

				expect( spy ).toHaveBeenCalledWith( {
					type: THEMES_REQUEST,
					siteId: 'wporg',
					query: {},
				} );
			} );
		} );
	} );

	describe( '#requestTheme()', () => {
		describe( 'with a wpcom site', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.2/themes/twentysixteen' )
					.reply( 200, { id: 'twentysixteen', name: 'Twenty Sixteen' } )
					.get( '/rest/v1.2/themes/twentyumpteen' )
					.reply( 404, {
						error: 'unknown_theme',
						message: 'Unknown theme',
					} );
			} );

			test( 'should dispatch request action when thunk triggered', () => {
				requestTheme( 'twentysixteen', 'wpcom' )( spy );

				expect( spy ).toHaveBeenCalledWith( {
					type: THEME_REQUEST,
					siteId: 'wpcom',
					themeId: 'twentysixteen',
				} );
			} );

			test( 'should dispatch themes request success action when request completes', () => {
				return requestTheme(
					'twentysixteen',
					'wpcom'
				)( spy ).then( () => {
					expect( spy ).toHaveBeenCalledWith( {
						type: THEME_REQUEST_SUCCESS,
						siteId: 'wpcom',
						themeId: 'twentysixteen',
					} );
				} );
			} );

			test( 'should dispatch fail action when request fails', () => {
				return requestTheme(
					'twentyumpteen',
					'wpcom'
				)( spy ).then( () => {
					expect( spy ).toHaveBeenCalledWith( {
						type: THEME_REQUEST_FAILURE,
						siteId: 'wpcom',
						themeId: 'twentyumpteen',
						error: expect.objectContaining( { message: 'Unknown theme' } ),
					} );
				} );
			} );
		} );

		describe( 'with a Jetpack site', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/sites/77203074/themes', { themes: 'twentyfifteen' } )
					.reply( 200, { themes: [ { id: 'twentyfifteen', name: 'Twenty Fifteen' } ] } )
					.post( '/rest/v1.1/sites/77203074/themes', { themes: 'twentyumpteen' } )
					.reply( 404, {
						error: 'unknown_theme',
						message: 'Unknown theme',
					} );
			} );

			test( 'should dispatch request action when thunk triggered', () => {
				requestTheme( 'twentyfifteen', 77203074 )( spy );

				expect( spy ).toHaveBeenCalledWith( {
					type: THEME_REQUEST,
					siteId: 77203074,
					themeId: 'twentyfifteen',
				} );
			} );

			test( 'should dispatch themes request success action when request completes', () => {
				return requestTheme(
					'twentyfifteen',
					77203074
				)( spy ).then( () => {
					expect( spy ).toHaveBeenCalledWith( {
						type: THEME_REQUEST_SUCCESS,
						siteId: 77203074,
						themeId: 'twentyfifteen',
					} );
				} );
			} );

			test( 'should dispatch fail action when request fails', () => {
				return requestTheme(
					'twentyumpteen',
					77203074
				)( spy ).then( () => {
					expect( spy ).toHaveBeenCalledWith( {
						type: THEME_REQUEST_FAILURE,
						siteId: 77203074,
						themeId: 'twentyumpteen',
						error: expect.objectContaining( { message: 'Unknown theme' } ),
					} );
				} );
			} );
		} );

		describe( 'with the WP.org API', () => {
			useNock( ( nock ) => {
				nock( 'https://api.wordpress.org' )
					.persist()
					.defaultReplyHeaders( {
						'Content-Type': 'application/json',
					} )
					.get(
						'/themes/info/1.1/?action=theme_information&request%5Bfields%5D%5Bextended_author%5D=true' +
							'&request%5Bslug%5D=twentyseventeen'
					)
					.reply( 200, { slug: 'twentyseventeen', name: 'Twenty Seventeen' } )
					.get(
						'/themes/info/1.1/?action=theme_information&request%5Bfields%5D%5Bextended_author%5D=true' +
							'&request%5Bslug%5D=twentyumpteen'
					)
					.reply( 200, 'false' );
			} );

			test( 'should dispatch request action when thunk triggered', () => {
				requestTheme( 'twentyseventeen', 'wporg' )( spy );

				expect( spy ).toHaveBeenCalledWith( {
					type: THEME_REQUEST,
					siteId: 'wporg',
					themeId: 'twentyseventeen',
				} );
			} );

			test( 'should dispatch themes request success action when request completes', () => {
				return requestTheme(
					'twentyseventeen',
					'wporg'
				)( spy ).then( () => {
					expect( spy ).toHaveBeenCalledWith( {
						type: THEME_REQUEST_SUCCESS,
						siteId: 'wporg',
						themeId: 'twentyseventeen',
					} );
				} );
			} );

			test( 'should dispatch fail action when request fails', () => {
				return requestTheme(
					'twentyumpteen',
					'wporg'
				)( spy ).then( () => {
					expect( spy ).toHaveBeenCalledWith( {
						type: THEME_REQUEST_FAILURE,
						siteId: 'wporg',
						themeId: 'twentyumpteen',
						error: 'Theme not found',
					} );
				} );
			} );
		} );
	} );

	describe( '#themeActivated()', () => {
		// block theme
		const maylandBlocksTheme = {
			id: 'mayland-blocks',
			stylesheet: 'pub/mayland-blocks',
			taxonomies: {
				theme_feature: [
					{
						name: 'Full Site Editing',
						slug: 'full-site-editing',
						term_id: '686035051',
					},
				],
			},
		};
		// classic theme
		const twentyfifteenTheme = {
			id: 'twentyfifteen',
			stylesheet: 'pub/twentyfifteen',
			taxonomies: {
				theme_feature: [
					{
						name: 'Auto Loading Homepage',
						slug: 'auto-loading-homepage',
						term_id: '687694703',
					},
				],
			},
		};

		const fakeGetState = () => ( {
			themes: {
				activeThemes: {
					2211667: 'twentyfifteen',
				},
				lastQuery: {
					2211667: {
						search: 'simple, white',
					},
				},
				queries: {
					wpcom: new ThemeQueryManager( {
						items: {
							[ maylandBlocksTheme.id ]: maylandBlocksTheme,
							[ twentyfifteenTheme.id ]: twentyfifteenTheme,
						},
					} ),
				},
			},
			sites: {
				items: {
					197431737: {
						ID: 197431737,
						jetpack: false,
					},
				},
			},
		} );

		describe( 'when switching between any theme', () => {
			test( 'should refresh the admin bar', () => {
				themeActivated( 'pub/mayland-blocks', 2211667 )( spy, fakeGetState );
				expect( spy ).toHaveBeenCalledWith( {
					type: 'THEME_ACTIVATE_SUCCESS',
					themeStylesheet: 'pub/mayland-blocks',
					siteId: 2211667,
					meta: {
						analytics: [
							{
								payload: {
									name: 'calypso_themeshowcase_theme_activate',
									properties: {
										previous_theme: 'twentyfifteen',
										purchased: false,
										search_taxonomies: '',
										search_term: 'simple, white',
										source: 'unknown',
										style_variation_slug: '',
										theme: 'mayland-blocks',
										theme_type: 'free',
									},
									service: 'tracks',
								},
								type: 'ANALYTICS_EVENT_RECORD',
							},
						],
					},
				} );
				expect( spy ).toHaveBeenCalledWith( {
					type: 'ADMIN_MENU_REQUEST',
					siteId: 2211667,
				} );
			} );
		} );

		test( 'should return an action object', () => {
			const expectedActivationSuccess = {
				meta: {
					analytics: [
						{
							payload: {
								name: 'calypso_themeshowcase_theme_activate',
								properties: {
									previous_theme: 'twentyfifteen',
									purchased: false,
									search_taxonomies: '',
									search_term: 'simple, white',
									source: 'unknown',
									style_variation_slug: '',
									theme: 'twentysixteen',
									theme_type: 'free',
								},
								service: 'tracks',
							},
							type: 'ANALYTICS_EVENT_RECORD',
						},
					],
				},
				type: THEME_ACTIVATE_SUCCESS,
				themeStylesheet: 'pub/twentysixteen',
				siteId: 2211667,
			};
			themeActivated( 'pub/twentysixteen', 2211667 )( spy, fakeGetState );
			expect( spy ).toHaveBeenCalledWith( {
				type: 'THEME_ACTIVATE_SUCCESS',
				themeStylesheet: 'pub/twentysixteen',
				siteId: 2211667,
				meta: {
					analytics: [
						{
							payload: {
								name: 'calypso_themeshowcase_theme_activate',
								properties: {
									previous_theme: 'twentyfifteen',
									purchased: false,
									search_taxonomies: '',
									search_term: 'simple, white',
									source: 'unknown',
									style_variation_slug: '',
									theme: 'twentysixteen',
									theme_type: 'free',
								},
								service: 'tracks',
							},
							type: 'ANALYTICS_EVENT_RECORD',
						},
					],
				},
			} );
			expect( spy ).toHaveBeenCalledWith( expectedActivationSuccess );
		} );
	} );

	describe( '#clearActivated()', () => {
		test( 'should return an action object', () => {
			const action = clearActivated( 22116677 );
			expect( action ).toEqual( {
				type: THEME_CLEAR_ACTIVATED,
				siteId: 22116677,
			} );
		} );
	} );

	describe( '#activateTheme()', () => {
		const getState = () => ( {
			themes: {
				queries: {
					wpcom: new ThemeQueryManager(),
				},
			},
			sites: {
				items: {},
			},
			productsList: {
				items: {},
			},
			purchases: {
				data: {},
			},
		} );

		const trackingData = {
			theme: 'twentysixteen',
			previous_theme: 'twentyfifteen',
			source: 'unknown',
			purchased: false,
			search_term: 'simple, white',
		};

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/2211667/themes/mine?_locale=user', { theme: 'twentysixteen' } )
				.reply( 200, { id: 'karuna', version: '1.0.3' } )
				.post( '/rest/v1.1/sites/2211667/themes/mine?_locale=user', { theme: 'badTheme' } )
				.reply( 404, {
					error: 'theme_not_found',
					message: 'The specified theme was not found',
				} );
		} );

		test( 'should dispatch request action when thunk is triggered', () => {
			activateTheme( 'twentysixteen', 2211667 )( spy, getState );

			expect( spy ).toHaveBeenCalledWith( {
				type: THEME_ACTIVATE,
				siteId: 2211667,
				themeId: 'twentysixteen',
			} );
		} );

		test( 'should dispatch theme activation success thunk when request completes', () => {
			return activateTheme(
				'twentysixteen',
				2211667,
				trackingData
			)( spy, getState ).then( () => {
				expect( spy.mock.calls[ 1 ][ 0 ].name ).toEqual( 'themeActivatedThunk' );
			} );
		} );

		test( 'should dispatch theme activation failure action when request completes', () => {
			const themeActivationFailure = {
				error: expect.objectContaining( { message: 'The specified theme was not found' } ),
				siteId: 2211667,
				themeId: 'badTheme',
				type: THEME_ACTIVATE_FAILURE,
			};

			return activateTheme(
				'badTheme',
				2211667,
				trackingData
			)( spy, getState ).then( () => {
				expect( spy ).toHaveBeenCalledWith( themeActivationFailure );
			} );
		} );
	} );

	describe( '#updateThemes()', () => {
		const themes = [
			{
				id: 'storefront',
				version: '4.1.0',
			},
			{
				id: 'twentysixteen',
				version: '5.3.0',
			},
		];

		const getState = () => ( {
			themes: {
				queries: {
					wpcom: new ThemeQueryManager(),
				},
			},
			sites: {
				items: {},
			},
			productsList: {
				items: {},
			},
			purchases: {
				data: {},
			},
		} );

		const successfulParameters = {
			themes: [ 'storefront', 'twentysixteen' ],
			action: 'update',
			autoupdate: false,
		};

		const badParameters = { themes: [ 'unknown' ] };

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/2211667/themes', successfulParameters )
				.reply( 200, { themes } )
				.post( '/rest/v1.1/sites/2211667/themes', badParameters )
				.reply( 404, {
					error: 'unknown_theme',
					message: 'The theme directory "unknown" does not exist.',
				} );
		} );

		test( 'Theme update action should be triggered', () => {
			updateThemes( [ 'storefront', 'twentysixteen' ], 2211667 )( spy );

			expect( spy ).toHaveBeenCalledWith( {
				type: THEMES_UPDATE,
				siteId: 2211667,
				themeSlugs: [ 'storefront', 'twentysixteen' ],
			} );
		} );

		test( 'should dispatch theme updated success thunk when request completes', () => {
			return updateThemes(
				[ 'storefront', 'twentysixteen' ],
				2211667
			)( spy ).then( () => {
				expect( spy.mock.calls[ 1 ][ 0 ].name ).toEqual( 'themeUpdatedThunk' );
			} );
		} );

		test( 'should dispatch theme update failure action when request completes', () => {
			const themeActivationFailure = {
				siteId: 2211667,
				themeSlugs: [ 'unknown' ],
				type: THEMES_UPDATE_FAILURE,
			};

			return updateThemes(
				[ 'unknown' ],
				2211667
			)( spy ).then( () => {
				expect( spy ).toHaveBeenCalledWith( themeActivationFailure );
			} );
		} );

		test( 'should update the badges in the UI by dispatching the actions', () => {
			themesUpdated( 2211667, [ 'storefront', 'twentysixteen' ] )( spy );

			expect( spy ).toHaveBeenCalledWith( {
				type: THEMES_UPDATE_SUCCESS,
				themeSlugs: [ 'storefront', 'twentysixteen' ],
				siteId: 2211667,
			} );

			expect( spy ).toHaveBeenCalledWith( {
				type: ADMIN_MENU_REQUEST,
				siteId: 2211667,
			} );

			spy.mock.calls[ 2 ][ 0 ]( spy, getState );

			expect( spy.mock.calls[ 3 ][ 0 ].type ).toEqual( THEMES_REQUEST );
		} );
	} );

	describe( '#installAndActivateTheme', () => {
		const stub = jest.fn();
		stub.mockReturnValue(
			new Promise( ( res ) => {
				res();
			} )
		);

		test( 'should dispatch installTheme() and activateTheme()', () => {
			return new Promise( ( done ) => {
				installAndActivateTheme(
					'karuna-wpcom',
					2211667
				)( stub ).then( () => {
					expect( stub ).toHaveBeenCalledWith(
						expect.toMatchFunction( installTheme( 'karuna-wpcom', 2211667 ) )
					);
					expect( stub ).toHaveBeenCalledWith(
						expect.toMatchFunction( activateTheme( 'karuna-wpcom', 2211667 ) )
					);
					done();
				} );
			} );
		} );
	} );

	describe( '#activate', () => {
		const stub = jest.fn();
		stub.mockReturnValue(
			new Promise( ( res ) => {
				res();
			} )
		);

		describe( 'on a WordPress.com site', () => {
			const fakeGetState = () => ( {
				sites: {
					items: {
						77203074: {
							jetpack: false,
						},
					},
				},
				themes: {
					queries: {
						wpcom: new ThemeQueryManager(),
					},
					themeActivationModal: {
						themeId: 'karuna',
						accepted: true,
					},
				},
			} );
			test( 'should dispatch (only) activateTheme() and pass the unsuffixed themeId', () => {
				return new Promise( ( done ) => {
					activate( 'karuna', 77203074 )( stub, fakeGetState ).then( () => {
						expect( stub ).toHaveBeenCalledWith(
							expect.toMatchFunction( activateTheme( 'karuna', 77203074 ) )
						);
						expect( stub ).not.toHaveBeenCalledWith(
							expect.toMatchFunction( installAndActivateTheme( 'karuna-wpcom', 77203074 ) )
						);
						done();
					} );
				} );
			} );
		} );

		describe( 'on a Jetpack site', () => {
			const sitesState = {
				sites: {
					items: {
						2211667: {
							jetpack: true,
						},
					},
				},
			};
			describe( 'if the theme is already installed', () => {
				const fakeGetState = () => ( {
					...sitesState,
					themes: {
						queries: {
							2211667: new ThemeQueryManager( {
								items: { karuna: {} },
							} ),
						},
						themeActivationModal: {
							themeId: 'karuna',
							accepted: true,
						},
					},
				} );
				test( 'should dispatch (only) activateTheme() and pass the unsuffixed themeId', () => {
					return new Promise( ( done ) => {
						activate( 'karuna', 2211667 )( stub, fakeGetState ).then( () => {
							expect( stub ).toHaveBeenCalledWith(
								expect.toMatchFunction( activateTheme( 'karuna', 2211667 ) )
							);
							expect( stub ).not.toHaveBeenCalledWith(
								expect.toMatchFunction( installAndActivateTheme( 'karuna-wpcom', 2211667 ) )
							);
							done();
						} );
					} );
				} );
			} );

			describe( "if the theme isn't installed", () => {
				const fakeGetState = () => ( {
					...sitesState,
					themes: {
						queries: {},
						themeActivationModal: {
							themeId: 'karuna',
							accepted: true,
						},
					},
				} );
				test( 'should dispatch (only) installAndActivateTheme() and pass the suffixed themeId', () => {
					return new Promise( ( done ) => {
						activate( 'karuna', 2211667 )( stub, fakeGetState ).then( () => {
							expect( stub ).not.toHaveBeenCalledWith(
								expect.toMatchFunction( activate( 'karuna', 2211667 ) )
							);
							expect( stub ).toHaveBeenCalledWith(
								expect.toMatchFunction( installAndActivateTheme( 'karuna-wpcom', 2211667 ) )
							);
							done();
						} );
					} );
				} );
			} );
		} );
	} );

	describe( '#requestActiveTheme', () => {
		const successResponse = {
			id: 'rebalance',
			screenshot:
				'https://i0.wp.com/s0.wp.com/wp-content/themes/pub/rebalance/screenshot.png?ssl=1',
			cost: {
				currency: 'USD',
				number: 0,
				display: '',
			},
			version: '1.1.1',
			download_url: 'https://public-api.wordpress.com/rest/v1/themes/download/rebalance.zip',
			trending_rank: 17,
			popularity_rank: 183,
			launch_date: '2016-05-13',
			name: 'Rebalance',
			description:
				'Rebalance is a new spin on the classic ' +
				'Imbalance 2 portfolio theme. It is a simple, modern' +
				'theme for photographers, artists, and graphic designers' +
				'looking to showcase their work.',
			tags: [
				'responsive-layout',
				'one-column',
				'two-columns',
				'three-columns',
				'custom-background',
				'custom-colors',
				'custom-menu',
				'featured-images',
				'featured-content-with-pages',
				'theme-options',
				'threaded-comments',
				'translation-ready',
			],
			preview_url: 'https://unittest.wordpress.com/?theme=pub/rebalance&hide_banners=true',
		};

		const failureResponse = {
			status: 404,
			code: 'unknown_blog',
			message: 'Unknown blog',
		};

		const fakeGetState = () => ( {
			sites: {
				items: {
					77203074: {
						jetpack: true,
					},
				},
			},
		} );

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/sites/2211667/themes/mine' )
				.reply( 200, successResponse )
				.get( '/rest/v1.1/sites/77203074/themes/mine' )
				.reply( 200, successResponse )
				.get( '/rest/v1.1/sites/666/themes/mine' )
				.reply( 404, failureResponse );
		} );

		test( 'should dispatch active theme request action when triggered', () => {
			requestActiveTheme( 2211667 )( spy );

			expect( spy ).toHaveBeenCalledWith( {
				type: ACTIVE_THEME_REQUEST,
				siteId: 2211667,
			} );
		} );

		describe( 'when request completes successfully', () => {
			test( 'should dispatch active theme request success action', () => {
				return requestActiveTheme( 2211667 )( spy, fakeGetState ).then( () => {
					expect( spy ).toHaveBeenCalledWith( {
						type: ACTIVE_THEME_REQUEST_SUCCESS,
						siteId: 2211667,
						theme: successResponse,
					} );
				} );
			} );
		} );

		test( 'should dispatch active theme request failure action when request completes', () => {
			return requestActiveTheme( 666 )( spy, fakeGetState ).then( () => {
				expect( spy ).toHaveBeenCalledWith( {
					type: ACTIVE_THEME_REQUEST_FAILURE,
					siteId: 666,
					error: expect.objectContaining( { message: 'Unknown blog' } ),
				} );
			} );
		} );
	} );

	describe( '#pollThemeTransferStatus', () => {
		const siteId = '2211667';

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( `/rest/v1.1/sites/${ siteId }/automated-transfers/status/1` )
				.reply( 200, { status: 'complete', message: 'all done', uploaded_theme_slug: 'mood' } )
				.get( `/rest/v1.1/sites/${ siteId }/automated-transfers/status/2` )
				.thrice()
				.reply( 200, { status: 'stuck', message: 'jammed' } )
				.get( `/rest/v1.1/sites/${ siteId }/automated-transfers/status/3` )
				.twice()
				.reply( 200, { status: 'progress', message: 'in progress' } )
				.get( `/rest/v1.1/sites/${ siteId }/automated-transfers/status/3` )
				.reply( 200, { status: 'complete', message: 'all done', uploaded_theme_slug: 'mood' } )
				.get( `/rest/v1.1/sites/${ siteId }/automated-transfers/status/4` )
				.reply( 400, 'something wrong' );
		} );

		test( 'should dispatch success on status complete', () => {
			return pollThemeTransferStatus(
				siteId,
				1
			)( spy ).then( () => {
				expect( spy ).toHaveBeenCalledWith( {
					type: THEME_TRANSFER_STATUS_RECEIVE,
					siteId,
					transferId: 1,
					status: 'complete',
					message: 'all done',
					themeId: 'mood',
				} );
			} );
		} );

		test( 'should time-out if status never complete', () => {
			return pollThemeTransferStatus(
				siteId,
				2,
				10,
				25
			)( spy ).then( () => {
				expect( spy ).toHaveBeenCalledWith( {
					type: THEME_TRANSFER_STATUS_FAILURE,
					siteId,
					transferId: 2,
					error: 'client timeout',
				} );
			} );
		} );

		test( 'should dispatch status update', async () => {
			await pollThemeTransferStatus( siteId, 3, 20 )( spy );
			// Two 'progress' then a 'complete'
			expect( spy ).toHaveBeenCalledTimes( 3 );
			expect( spy ).toHaveBeenCalledWith( {
				type: THEME_TRANSFER_STATUS_RECEIVE,
				siteId: siteId,
				transferId: 3,
				status: 'progress',
				message: 'in progress',
				themeId: undefined,
			} );
			expect( spy ).toHaveBeenCalledWith( {
				type: THEME_TRANSFER_STATUS_RECEIVE,
				siteId: siteId,
				transferId: 3,
				status: 'complete',
				message: 'all done',
				themeId: 'mood',
			} );
		} );

		test( 'should dispatch failure on receipt of error', async () => {
			await pollThemeTransferStatus( siteId, 4 )( spy );
			expect( spy ).toHaveBeenCalledWith(
				expect.objectContaining( {
					type: THEME_TRANSFER_STATUS_FAILURE,
					siteId,
					transferId: 4,
				} )
			);
			expect( spy ).toHaveBeenCalledWith(
				expect.objectContaining( { error: expect.toBeTruthy() } )
			);
		} );
	} );

	describe( '#initiateThemeTransfer', () => {
		const siteId = '2211667';

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.post( `/rest/v1.1/sites/${ siteId }/automated-transfers/initiate` )
				.reply( 200, { success: true, status: 'progress', transfer_id: 1 } )
				.get( `/rest/v1.1/sites/${ siteId }/automated-transfers/initiate` )
				.reply( 400, 'some problem' );
		} );

		test( 'should dispatch success', () => {
			return initiateThemeTransfer( siteId )( spy ).then( () => {
				expect( spy ).toHaveBeenCalledTimes( 3 );

				expect( spy ).toHaveBeenCalledWith(
					expect.objectContaining( {
						meta: expect.objectContaining( {} ),
						type: THEME_TRANSFER_INITIATE_REQUEST,
						siteId,
					} )
				);

				expect( spy ).toHaveBeenCalledWith(
					expect.objectContaining( {
						meta: expect.objectContaining( {} ),
						type: THEME_TRANSFER_INITIATE_SUCCESS,
						siteId,
						transferId: 1,
					} )
				);

				expect( spy ).toHaveBeenCalledWith( expect.any( Function ) );
			} );
		} );
		test( 'should dispatch failure on error', () => {
			/* eslint-disable jest/no-conditional-expect */
			return initiateThemeTransfer( siteId )( spy ).catch( () => {
				expect( spy ).toHaveBeenCalledTimes( 1 );

				expect( spy ).toHaveBeenCalledWith(
					expect.objectContaining( {
						type: THEME_TRANSFER_INITIATE_FAILURE,
						siteId,
					} )
				);
				expect( spy ).toHaveBeenCalledWith(
					expect.objectContaining( { error: expect.toBeTruthy() } )
				);
			} );
			/* eslint-enable jest/no-conditional-expect */
		} );
	} );

	describe( '#installTheme', () => {
		const getState = () => ( {
			themes: {
				queries: {
					wpcom: new ThemeQueryManager(),
				},
			},
		} );

		const successResponse = {
			id: 'karuna-wpcom',
			screenshot:
				'//i0.wp.com/budzanowski.wpsandbox.me/wp-content/themes/karuna-wpcom/screenshot.png',
			active: false,
			name: 'Karuna',
			theme_uri: 'https://wordpress.com/themes/karuna/',
			description:
				'Karuna is a clean business theme designed with health and wellness-focused sites in mind.' +
				' With bright, bold colors, prominent featured images, and support for customer testimonials',
			author: 'Automattic',
			author_uri: 'http://wordpress.com/themes/',
			version: '1.1.0',
			autoupdate: false,
			log: [
				[
					'Unpacking the package&#8230;',
					'Installing the theme&#8230;',
					'Theme installed successfully.',
				],
			],
		};

		const downloadFailureResponse = {
			status: 400,
			code: 'problem_fetching_theme',
			message: 'Problem downloading theme',
		};

		const alreadyInstalledFailureResponse = {
			status: 400,
			code: 'theme_already_installed',
			message: 'The theme is already installed',
		};

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/2211667/themes/karuna-wpcom/install' )
				.reply( 200, successResponse )
				.post( '/rest/v1.1/sites/2211667/themes/typist-wpcom/install' )
				.reply( 400, downloadFailureResponse )
				.post( '/rest/v1.1/sites/2211667/themes/pinboard-wpcom/install' )
				.reply( 400, alreadyInstalledFailureResponse );
		} );

		test( 'should dispatch install theme request action when triggered', () => {
			installTheme( 'karuna-wpcom', 2211667 )( spy, getState );

			expect( spy ).toHaveBeenCalledWith( {
				type: THEME_INSTALL,
				siteId: 2211667,
				themeId: 'karuna-wpcom',
			} );
		} );

		test( 'should dispatch wpcom theme install request success action when request completes', () => {
			return installTheme( 'karuna-wpcom', 2211667 )( spy, getState ).then( () => {
				expect( spy ).toHaveBeenCalledWith( {
					type: THEME_INSTALL_SUCCESS,
					siteId: 2211667,
					themeId: 'karuna-wpcom',
				} );
			} );
		} );

		test( 'should dispatch wpcom theme install request failure action when theme was not found', () => {
			return installTheme( 'typist-wpcom', 2211667 )( spy, getState ).then( () => {
				expect( spy ).toHaveBeenCalledWith( {
					type: THEME_INSTALL_FAILURE,
					siteId: 2211667,
					themeId: 'typist-wpcom',
					error: expect.objectContaining( { message: 'Problem downloading theme' } ),
				} );
			} );
		} );

		test( 'should dispatch wpcom theme install request failure action when theme is already installed', () => {
			return installTheme( 'pinboard-wpcom', 2211667 )( spy, getState ).then( () => {
				expect( spy ).toHaveBeenCalledWith( {
					type: THEME_INSTALL_FAILURE,
					siteId: 2211667,
					themeId: 'pinboard-wpcom',
					error: expect.objectContaining( { message: 'The theme is already installed' } ),
				} );
			} );
		} );
	} );

	describe( 'deleteTheme', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.post( '/rest/v1.1/sites/2211667/themes/karuna/delete' )
				.reply( 200, { id: 'karuna', name: 'Karuna' } )
				.post( '/rest/v1.1/sites/2211667/themes/blahblah/delete' )
				.reply( 404, { code: 'unknown_theme' } );
		} );

		test( 'should dispatch success action on success response', () => {
			return deleteTheme(
				'karuna',
				2211667
			)( spy ).then( () => {
				expect( spy ).toHaveBeenCalledWith( {
					type: THEME_DELETE_SUCCESS,
					siteId: 2211667,
					themeId: 'karuna',
					themeName: 'Karuna',
				} );
			} );
		} );

		test( 'should dispatch failure action on error response', () => {
			return deleteTheme(
				'blahblah',
				2211667
			)( spy ).then( () => {
				expect( spy ).toHaveBeenCalledWith(
					expect.objectContaining( {
						type: THEME_DELETE_FAILURE,
						siteId: 2211667,
						themeId: 'blahblah',
						error: expect.toBeTruthy(),
					} )
				);
			} );
		} );
	} );

	describe( '#installAndTryAndCustomizeTheme', () => {
		const stub = jest.fn();
		stub.mockReturnValue(
			new Promise( ( res ) => {
				res();
			} )
		);

		test( 'should dispatch installTheme(), and tryAndCustomizeTheme()', () => {
			return new Promise( ( done ) => {
				installAndTryAndCustomizeTheme(
					'karuna-wpcom',
					2211667
				)( stub ).then( () => {
					expect( stub ).toHaveBeenCalledWith(
						expect.toMatchFunction( installTheme( 'karuna-wpcom', 2211667 ) )
					);
					expect( stub ).toHaveBeenCalledWith(
						expect.toMatchFunction( tryAndCustomizeTheme( 'karuna-wpcom', 2211667 ) )
					);
					done();
				} );
			} );
		} );
	} );

	describe( '#tryAndCustomize', () => {
		const stub = jest.fn();
		stub.mockReturnValue(
			new Promise( ( res ) => {
				res();
			} )
		);

		describe( 'on a WordPress.com site', () => {
			const fakeGetState = () => ( {
				sites: {
					items: {
						77203074: {
							jetpack: false,
						},
					},
				},
			} );
			test( 'should dispatch (only) activateTheme() and pass the unsuffixed themeId', () => {
				return new Promise( ( done ) => {
					tryAndCustomize( 'karuna', 77203074 )( stub, fakeGetState ).then( () => {
						expect( stub ).toHaveBeenCalledWith(
							expect.toMatchFunction( tryAndCustomizeTheme( 'karuna', 77203074 ) )
						);
						expect( stub ).not.toHaveBeenCalledWith(
							expect.toMatchFunction( installAndTryAndCustomizeTheme( 'karuna-wpcom', 77203074 ) )
						);
						done();
					} );
				} );
			} );
		} );

		describe( 'on a Jetpack site', () => {
			const sitesState = {
				sites: {
					items: {
						2211667: {
							jetpack: true,
						},
					},
				},
			};
			describe( 'if the theme is already installed', () => {
				const fakeGetState = () => ( {
					...sitesState,
					themes: {
						queries: {
							2211667: new ThemeQueryManager( {
								items: { karuna: {} },
							} ),
						},
					},
				} );
				test( 'should dispatch (only) tryAndCustomizeTheme() and pass the unsuffixed themeId', () => {
					return new Promise( ( done ) => {
						tryAndCustomize( 'karuna', 2211667 )( stub, fakeGetState ).then( () => {
							expect( stub ).toHaveBeenCalledWith(
								expect.toMatchFunction( tryAndCustomizeTheme( 'karuna', 2211667 ) )
							);
							expect( stub ).not.toHaveBeenCalledWith(
								expect.toMatchFunction( installAndTryAndCustomizeTheme( 'karuna-wpcom', 2211667 ) )
							);
							done();
						} );
					} );
				} );
			} );

			describe( "if the theme isn't installed", () => {
				const fakeGetState = () => ( {
					...sitesState,
					themes: {
						queries: {},
					},
				} );
				test( 'should dispatch (only) installAndTryAndCustomizeTheme() and pass the suffixed themeId', () => {
					return new Promise( ( done ) => {
						tryAndCustomize( 'karuna', 2211667 )( stub, fakeGetState ).then( () => {
							expect( stub ).not.toHaveBeenCalledWith(
								expect.toMatchFunction( tryAndCustomize( 'karuna', 2211667 ) )
							);
							expect( stub ).toHaveBeenCalledWith(
								expect.toMatchFunction( installAndTryAndCustomizeTheme( 'karuna-wpcom', 2211667 ) )
							);
							done();
						} );
					} );
				} );
			} );
		} );
	} );

	describe( '#livePreview', () => {
		const dispatch = jest.fn();
		dispatch.mockReturnValue(
			new Promise( ( res ) => {
				res();
			} )
		);
		const livePreviewStartAction = {
			type: 'LIVE_PREVIEW_START',
			themeId: 'pendant',
			meta: {
				analytics: [
					{
						payload: {
							name: 'calypso_block_theme_live_preview_click',
							properties: {
								active_theme: 'twentyfifteen',
								site_id: 2211667,
								source: 'detail',
								theme: 'pendant',
								theme_style: 'pendant',
								theme_type: 'free',
							},
							service: 'tracks',
						},
						type: 'ANALYTICS_EVENT_RECORD',
					},
				],
			},
		};
		describe( 'on a WordPress.com site', () => {
			const state = () => ( {
				sites: {
					items: {
						2211667: {
							jetpack: false,
						},
					},
				},
				themes: {
					activeThemes: {
						2211667: 'twentyfifteen',
					},
					queries: {
						wpcom: new ThemeQueryManager( {
							items: {},
						} ),
					},
				},
			} );
			test( 'should redirect users to the Live Preview', () => {
				return new Promise( ( done ) => {
					livePreview(
						2211667,
						'pendant',
						'detail'
					)( dispatch, state ).then( () => {
						expect( dispatch ).toHaveBeenCalledWith( livePreviewStartAction );
						expect( dispatch ).toHaveBeenCalledWith(
							expect.toMatchFunction( redirectToLivePreview( 'pendant', 2211667 ) )
						);
						expect( dispatch ).not.toHaveBeenCalledWith( installTheme( 'pendant', 2211667 ) );
						done();
					} );
				} );
			} );
		} );
		describe( 'on a Jetpack site', () => {
			const baseState = {
				sites: {
					items: {
						2211667: {
							jetpack: true,
						},
					},
				},
				themes: {
					activeThemes: {
						2211667: 'twentyfifteen',
					},
				},
			};
			describe( 'if the theme is already installed', () => {
				const state = () => ( {
					...baseState,
					themes: {
						...baseState.themes,
						queries: {
							2211667: new ThemeQueryManager( {
								items: { pendant: {} },
							} ),
						},
					},
				} );
				test( 'should redirect users to the Live Preview', () => {
					return new Promise( ( done ) => {
						livePreview(
							2211667,
							'pendant',
							'detail'
						)( dispatch, state ).then( () => {
							expect( dispatch ).toHaveBeenCalledWith( livePreviewStartAction );
							expect( dispatch ).toHaveBeenCalledWith(
								expect.toMatchFunction( redirectToLivePreview( 'pendant', 2211667 ) )
							);
							expect( dispatch ).not.toHaveBeenCalledWith( installTheme( 'pendant', 2211667 ) );
							done();
						} );
					} );
				} );
			} );
			describe( "if the theme isn't installed", () => {
				const state = () => ( {
					...baseState,
					themes: {
						...baseState.themes,
						queries: {},
					},
				} );
				test( 'should install the theme and then redirect users to the Live Preview', () => {
					return new Promise( ( done ) => {
						livePreview(
							2211667,
							'pendant',
							'detail'
						)( dispatch, state ).then( () => {
							expect( dispatch ).toHaveBeenCalledWith( livePreviewStartAction );
							expect( dispatch ).toHaveBeenCalledWith(
								expect.toMatchFunction( installTheme( 'pendant', 2211667 ) )
							);
							expect( dispatch ).toHaveBeenCalledWith(
								expect.toMatchFunction( redirectToLivePreview( 'pendant', 2211667 ) )
							);
							done();
						} );
					} );
				} );
			} );
		} );
	} );

	describe( '#requestThemeFilters', () => {
		test( 'should return THEME_FILTERS_REQUEST action', () => {
			const action = requestThemeFilters();
			expect( action ).toEqual( { type: THEME_FILTERS_REQUEST, locale: null } );
		} );
	} );

	describe( '#getRecommendedThemes()', () => {
		const filter = 'nonsense-test-filter';
		test( 'should dispatch fetch action', () => {
			getRecommendedThemes( filter )( spy );
			expect( spy ).toHaveBeenCalledWith( { type: RECOMMENDED_THEMES_FETCH, filter } );
		} );
	} );

	describe( '#receiveRecommendedThemes()', () => {
		const themes = [ 'a', 'b', 'c' ];
		const filter = 'test-filter-nonsense';
		test( 'should dispatch success action with themes as payload', () => {
			receiveRecommendedThemes( themes, filter )( spy );
			expect( spy ).toHaveBeenCalledWith( {
				type: RECOMMENDED_THEMES_SUCCESS,
				payload: themes,
				filter,
			} );
		} );
	} );

	describe( 'addExternalManagedThemeToCart', () => {
		const siteId = 123456;
		const siteSlug = 'testsite389140927432.wordpress.com';
		// Externally managed theme
		const twentyfifteenTheme = {
			id: 'twentyfifteen',
			stylesheet: 'premium/twentyfifteen',
			theme_type: 'managed-external',
		};

		const themes = {
			queries: {
				wpcom: new ThemeQueryManager( {
					items: {
						[ twentyfifteenTheme.id ]: twentyfifteenTheme,
					},
				} ),
			},
		};

		const sites = {
			items: {
				[ siteId ]: {
					ID: siteId,
					URL: `https://${ siteSlug }`,
				},
			},
		};

		test( 'Should throw error if theme is not externally managed', async () => {
			const getState = () => ( {
				themes: {
					queries: {
						wpcom: new ThemeQueryManager( {
							items: {
								[ twentyfifteenTheme.id ]: {
									...twentyfifteenTheme,
									theme_type: 'manged-internal',
								},
							},
						} ),
					},
				},
			} );

			await expect(
				addExternalManagedThemeToCart( twentyfifteenTheme.id, siteId )( spy, getState )
			).rejects.toThrow( 'Theme is not externally managed' );
		} );

		test( 'Should throw error if theme is already purchased', async () => {
			const getState = () => ( {
				themes,
				purchases: {
					data: [
						{
							ID: 1234567,
							blog_id: siteId,
							meta: twentyfifteenTheme.id,
							product_type: 'theme',
						},
					],
				},
				sites,
			} );

			await expect(
				addExternalManagedThemeToCart( twentyfifteenTheme.id, siteId )( spy, getState )
			).rejects.toThrow( 'Theme is already purchased' );
		} );
	} );

	describe( '#requestThemeOnAtomic()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/wp/v2/sites/1234/themes/makoney' )
				.reply( 200, { id: 'makoney', name: 'Makoney' } )
				.get( '/wp/v2/sites/1234/themes/solarone' )
				.reply( 404, {
					error: 'unknown_theme',
					message: 'Unknown theme',
				} );
		} );

		test( 'should dispatch THEME_REQUEST', () => {
			requestThemeOnAtomic( 'makoney', 1234 )( spy );

			expect( spy ).toHaveBeenCalledWith( {
				type: THEME_REQUEST,
				siteId: 1234,
				themeId: 'makoney',
			} );
		} );

		test( 'should dispatch THEME_REQUEST_SUCCESS on success', () => {
			return requestThemeOnAtomic(
				'makoney',
				1234
			)( spy ).then( () => {
				expect( spy ).toHaveBeenCalledWith( {
					type: THEME_REQUEST_SUCCESS,
					siteId: 1234,
					themeId: 'makoney',
				} );
			} );
		} );

		test( 'should dispatch THEME_REQUEST_FAILURE on failure', () => {
			return requestThemeOnAtomic(
				'solarone',
				1234
			)( spy ).finally( () => {
				expect( spy ).toHaveBeenCalledWith( {
					type: THEME_REQUEST_FAILURE,
					siteId: 1234,
					themeId: 'solarone',
					error: expect.objectContaining( { message: 'Unknown theme' } ),
				} );
			} );
		} );
	} );
} );
