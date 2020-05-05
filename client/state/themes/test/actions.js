/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';
// Importing `jest-fetch-mock` adds a jest-friendly `fetch` polyfill to the global scope.
import 'jest-fetch-mock';

/**
 * Internal dependencies
 */
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
} from '../actions';
import ThemeQueryManager from 'lib/query-manager/theme';
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
} from 'state/themes/action-types';
import useNock from 'test/helpers/use-nock';

// Gets rid of warnings such as 'UnhandledPromiseRejectionWarning: Error: No available storage method found.'
jest.mock( 'lib/user', () => () => {} );

describe( 'actions', () => {
	const spy = sinon.spy();

	function isEqualFunction( f1, f2 ) {
		// TODO: Also compare params!
		return f1.toString() === f2.toString();
	}

	function matchFunction( fn ) {
		return sinon.match( ( value ) => isEqualFunction( value, fn ) );
	}

	beforeEach( () => {
		spy.resetHistory();
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

			expect( spy ).to.have.been.calledWith( {
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
				expect( spy ).to.have.been.calledWith( {
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
				expect( spy ).to.have.been.calledWith( {
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
		describe( 'with a wpcom site', () => {
			let nockScope;
			useNock( ( nock ) => {
				nockScope = nock( 'https://public-api.wordpress.com:443' )
					.get( '/rest/v1.2/themes' )
					.reply( 200, {
						found: 2,
						themes: [
							{ ID: 'twentysixteen', name: 'Twenty Sixteen' },
							{ ID: 'mood', name: 'Mood' },
						],
					} );
			} );

			test( 'should dispatch fetch action when thunk triggered', () => {
				requestThemes( 'wpcom' )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: THEMES_REQUEST,
					siteId: 'wpcom',
					query: {},
				} );
				expect( nockScope.isDone() ).to.be.true;
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
				requestThemes( 77203074 )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: THEMES_REQUEST,
					siteId: 77203074,
					query: {},
				} );
			} );

			test( 'should dispatch fail action when request fails', () => {
				return requestThemes( 1916284 )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: THEMES_REQUEST_FAILURE,
						siteId: 1916284,
						query: {},
						error: sinon.match( { message: 'User cannot access this private blog.' } ),
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
				requestThemes( 'wporg' )( spy );

				expect( spy ).to.have.been.calledWith( {
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

				expect( spy ).to.have.been.calledWith( {
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
					expect( spy ).to.have.been.calledWith( {
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
					expect( spy ).to.have.been.calledWith( {
						type: THEME_REQUEST_FAILURE,
						siteId: 'wpcom',
						themeId: 'twentyumpteen',
						error: sinon.match( { message: 'Unknown theme' } ),
					} );
				} );
			} );
		} );

		describe( 'with a Jetpack site', () => {
			// see lib/wpcom-undocumented/lib/undocumented#jetpackThemeDetails
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

				expect( spy ).to.have.been.calledWith( {
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
					expect( spy ).to.have.been.calledWith( {
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
					expect( spy ).to.have.been.calledWith( {
						type: THEME_REQUEST_FAILURE,
						siteId: 77203074,
						themeId: 'twentyumpteen',
						error: sinon.match( { message: 'Unknown theme' } ),
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

				expect( spy ).to.have.been.calledWith( {
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
					expect( spy ).to.have.been.calledWith( {
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
					expect( spy ).to.have.been.calledWith( {
						type: THEME_REQUEST_FAILURE,
						siteId: 'wporg',
						themeId: 'twentyumpteen',
						error: sinon.match( 'not found' ),
					} );
				} );
			} );
		} );
	} );

	describe( '#themeActivated()', () => {
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
									theme: 'twentysixteen',
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
				},
			} );

			themeActivated( 'pub/twentysixteen', 2211667 )( spy, fakeGetState );
			expect( spy ).to.have.been.calledWith( expectedActivationSuccess );
		} );
	} );

	describe( '#clearActivated()', () => {
		test( 'should return an action object', () => {
			const action = clearActivated( 22116677 );
			expect( action ).to.eql( {
				type: THEME_CLEAR_ACTIVATED,
				siteId: 22116677,
			} );
		} );
	} );

	describe( '#activateTheme()', () => {
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
				.post( '/rest/v1.1/sites/2211667/themes/mine', { theme: 'twentysixteen' } )
				.reply( 200, { id: 'karuna', version: '1.0.3' } )
				.post( '/rest/v1.1/sites/2211667/themes/mine', { theme: 'badTheme' } )
				.reply( 404, {
					error: 'theme_not_found',
					message: 'The specified theme was not found',
				} );
		} );

		test( 'should dispatch request action when thunk is triggered', () => {
			activateTheme( 'twentysixteen', 2211667 )( spy );

			expect( spy ).to.have.been.calledWith( {
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
			)( spy ).then( () => {
				expect( spy.secondCall.args[ 0 ].name ).to.equal( 'themeActivatedThunk' );
			} );
		} );

		test( 'should dispatch theme activation failure action when request completes', () => {
			const themeActivationFailure = {
				error: sinon.match( { message: 'The specified theme was not found' } ),
				siteId: 2211667,
				themeId: 'badTheme',
				type: THEME_ACTIVATE_FAILURE,
			};

			return activateTheme(
				'badTheme',
				2211667,
				trackingData
			)( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( themeActivationFailure );
			} );
		} );
	} );

	describe( '#installAndActivateTheme', () => {
		const stub = sinon.stub();
		stub.returns(
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
					expect( stub ).to.have.been.calledWith(
						matchFunction( installTheme( 'karuna-wpcom', 2211667 ) )
					);
					expect( stub ).to.have.been.calledWith(
						matchFunction( activateTheme( 'karuna-wpcom', 2211667 ) )
					);
					done();
				} );
			} );
		} );
	} );

	describe( '#activate', () => {
		const stub = sinon.stub();
		stub.returns(
			new Promise( ( res ) => {
				res();
			} )
		);

		describe( 'on a WordPress.com site', () => {
			stub.resetHistory();
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
				},
			} );
			test( 'should dispatch (only) activateTheme() and pass the unsuffixed themeId', () => {
				return new Promise( ( done ) => {
					activate( 'karuna', 77203074 )( stub, fakeGetState ).then( () => {
						expect( stub ).to.have.been.calledWith(
							matchFunction( activateTheme( 'karuna', 77203074 ) )
						);
						expect( stub ).to.not.have.been.calledWith(
							matchFunction( installAndActivateTheme( 'karuna-wpcom', 77203074 ) )
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
				stub.resetHistory();
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
				test( 'should dispatch (only) activateTheme() and pass the unsuffixed themeId', () => {
					return new Promise( ( done ) => {
						activate( 'karuna', 2211667 )( stub, fakeGetState ).then( () => {
							expect( stub ).to.have.been.calledWith(
								matchFunction( activateTheme( 'karuna', 2211667 ) )
							);
							expect( stub ).to.not.have.been.calledWith(
								matchFunction( installAndActivateTheme( 'karuna-wpcom', 2211667 ) )
							);
							done();
						} );
					} );
				} );
			} );

			describe( "if the theme isn't installed", () => {
				stub.resetHistory();
				const fakeGetState = () => ( {
					...sitesState,
					themes: {
						queries: {},
					},
				} );
				test( 'should dispatch (only) installAndActivateTheme() and pass the suffixed themeId', () => {
					return new Promise( ( done ) => {
						activate( 'karuna', 2211667 )( stub, fakeGetState ).then( () => {
							expect( stub ).to.not.have.been.calledWith(
								matchFunction( activate( 'karuna', 2211667 ) )
							);
							expect( stub ).to.have.been.calledWith(
								matchFunction( installAndActivateTheme( 'karuna-wpcom', 2211667 ) )
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

			expect( spy ).to.have.been.calledWith( {
				type: ACTIVE_THEME_REQUEST,
				siteId: 2211667,
			} );
		} );

		describe( 'when request completes successfully', () => {
			test( 'should dispatch active theme request success action', () => {
				return requestActiveTheme( 2211667 )( spy, fakeGetState ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: ACTIVE_THEME_REQUEST_SUCCESS,
						siteId: 2211667,
						theme: successResponse,
					} );
				} );
			} );
		} );

		test( 'should dispatch active theme request failure action when request completes', () => {
			return requestActiveTheme( 666 )( spy, fakeGetState ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: ACTIVE_THEME_REQUEST_FAILURE,
					siteId: 666,
					error: sinon.match( { message: 'Unknown blog' } ),
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
				1,
				'themes'
			)( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
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
				'themes',
				10,
				25
			)( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: THEME_TRANSFER_STATUS_FAILURE,
					siteId,
					transferId: 2,
					error: 'client timeout',
				} );
			} );
		} );

		test( 'should dispatch status update', () => {
			return pollThemeTransferStatus(
				siteId,
				3,
				'themes',
				20
			)( spy ).then( () => {
				// Two 'progress' then a 'complete'
				expect( spy ).to.have.callCount( 4 );
				expect( spy ).to.have.been.calledWith( {
					type: THEME_TRANSFER_STATUS_RECEIVE,
					siteId: siteId,
					transferId: 3,
					status: 'progress',
					message: 'in progress',
					themeId: undefined,
				} );
				expect( spy ).to.have.been.calledWith( {
					type: THEME_TRANSFER_STATUS_RECEIVE,
					siteId: siteId,
					transferId: 3,
					status: 'complete',
					message: 'all done',
					themeId: 'mood',
				} );
			} );
		} );

		test( 'should dispatch failure on receipt of error', () => {
			return pollThemeTransferStatus(
				siteId,
				4,
				'themes'
			)( spy ).then( () => {
				expect( spy ).to.have.been.calledWithMatch( {
					type: THEME_TRANSFER_STATUS_FAILURE,
					siteId,
					transferId: 4,
				} );
				expect( spy ).to.have.been.calledWith( sinon.match.has( 'error', sinon.match.truthy ) );
			} );
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
				expect( spy ).to.have.been.calledThrice;

				expect( spy ).to.have.been.calledWith( {
					meta: sinon.match.object,
					type: THEME_TRANSFER_INITIATE_REQUEST,
					siteId,
				} );

				expect( spy ).to.have.been.calledWith( {
					meta: sinon.match.object,
					type: THEME_TRANSFER_INITIATE_SUCCESS,
					siteId,
					transferId: 1,
				} );

				expect( spy ).to.have.been.calledWith( sinon.match.func );
			} );
		} );

		test( 'should dispatch failure on error', () => {
			return initiateThemeTransfer( siteId )( spy ).catch( () => {
				expect( spy ).to.have.been.calledOnce;

				expect( spy ).to.have.been.calledWithMatch( {
					type: THEME_TRANSFER_INITIATE_FAILURE,
					siteId,
				} );
				expect( spy ).to.have.been.calledWith( sinon.match.has( 'error', sinon.match.truthy ) );
			} );
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

			expect( spy ).to.have.been.calledWith( {
				type: THEME_INSTALL,
				siteId: 2211667,
				themeId: 'karuna-wpcom',
			} );
		} );

		test( 'should dispatch wpcom theme install request success action when request completes', () => {
			return installTheme( 'karuna-wpcom', 2211667 )( spy, getState ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: THEME_INSTALL_SUCCESS,
					siteId: 2211667,
					themeId: 'karuna-wpcom',
				} );
			} );
		} );

		test( 'should dispatch wpcom theme install request failure action when theme was not found', () => {
			return installTheme( 'typist-wpcom', 2211667 )( spy, getState ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: THEME_INSTALL_FAILURE,
					siteId: 2211667,
					themeId: 'typist-wpcom',
					error: sinon.match( { message: 'Problem downloading theme' } ),
				} );
			} );
		} );

		test( 'should dispatch wpcom theme install request failure action when theme is already installed', () => {
			return installTheme( 'pinboard-wpcom', 2211667 )( spy, getState ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: THEME_INSTALL_FAILURE,
					siteId: 2211667,
					themeId: 'pinboard-wpcom',
					error: sinon.match( { message: 'The theme is already installed' } ),
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
				expect( spy ).to.have.been.calledWith( {
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
				expect( spy ).to.have.been.calledWith( {
					type: THEME_DELETE_FAILURE,
					siteId: 2211667,
					themeId: 'blahblah',
					error: sinon.match.truthy,
				} );
			} );
		} );
	} );

	describe( '#installAndTryAndCustomizeTheme', () => {
		const stub = sinon.stub();
		stub.returns(
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
					expect( stub ).to.have.been.calledWith(
						matchFunction( installTheme( 'karuna-wpcom', 2211667 ) )
					);
					expect( stub ).to.have.been.calledWith(
						matchFunction( tryAndCustomizeTheme( 'karuna-wpcom', 2211667 ) )
					);
					done();
				} );
			} );
		} );
	} );

	describe( '#tryAndCustomize', () => {
		const stub = sinon.stub();
		stub.returns(
			new Promise( ( res ) => {
				res();
			} )
		);

		describe( 'on a WordPress.com site', () => {
			stub.resetHistory();
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
						expect( stub ).to.have.been.calledWith(
							matchFunction( tryAndCustomizeTheme( 'karuna', 77203074 ) )
						);
						expect( stub ).to.not.have.been.calledWith(
							matchFunction( installAndTryAndCustomizeTheme( 'karuna-wpcom', 77203074 ) )
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
				stub.resetHistory();
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
							expect( stub ).to.have.been.calledWith(
								matchFunction( tryAndCustomizeTheme( 'karuna', 2211667 ) )
							);
							expect( stub ).to.not.have.been.calledWith(
								matchFunction( installAndTryAndCustomizeTheme( 'karuna-wpcom', 2211667 ) )
							);
							done();
						} );
					} );
				} );
			} );

			describe( "if the theme isn't installed", () => {
				stub.resetHistory();
				const fakeGetState = () => ( {
					...sitesState,
					themes: {
						queries: {},
					},
				} );
				test( 'should dispatch (only) installAndTryAndCustomizeTheme() and pass the suffixed themeId', () => {
					return new Promise( ( done ) => {
						tryAndCustomize( 'karuna', 2211667 )( stub, fakeGetState ).then( () => {
							expect( stub ).to.not.have.been.calledWith(
								matchFunction( tryAndCustomize( 'karuna', 2211667 ) )
							);
							expect( stub ).to.have.been.calledWith(
								matchFunction( installAndTryAndCustomizeTheme( 'karuna-wpcom', 2211667 ) )
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
			expect( action ).to.deep.equal( { type: THEME_FILTERS_REQUEST } );
		} );
	} );

	describe( '#getRecommendedThemes()', () => {
		test( 'should dispatch fetch action', () => {
			getRecommendedThemes()( spy );
			expect( spy ).to.have.been.calledWith( { type: RECOMMENDED_THEMES_FETCH } );
		} );
	} );

	describe( '#receiveRecommendedThemes()', () => {
		const themes = [];
		test( 'should dispatch success action with themes as payload', () => {
			receiveRecommendedThemes( themes )( spy );
			expect( spy ).to.have.been.calledWith( {
				type: RECOMMENDED_THEMES_SUCCESS,
				payload: themes,
			} );
		} );
	} );
} );
