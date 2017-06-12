/**
 * External dependencies
 */
import sinon from 'sinon';
import { expect } from 'chai';
import useMockery from 'test/helpers/use-mockery';

/**
 * Internal dependencies
 */
import {
	ACTIVE_THEME_REQUEST,
	ACTIVE_THEME_REQUEST_SUCCESS,
	ACTIVE_THEME_REQUEST_FAILURE,
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
} from 'state/action-types';
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
} from '../actions';
import useNock from 'test/helpers/use-nock';
import ThemeQueryManager from 'lib/query-manager/theme';

describe( 'actions', () => {
	const spy = sinon.spy();

	function isEqualFunction( f1, f2 ) {
		// TODO: Also compare params!
		return f1.toString() === f2.toString();
	}

	function matchFunction( fn ) {
		return sinon.match( ( value ) => (
			isEqualFunction( value, fn )
		) );
	}

	beforeEach( () => {
		spy.reset();
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

		it( 'should dispatch THEMES_REQUEST_SUCCESS action', () => {
			const theme = { id: 'twentysixteen', name: 'Twenty Sixteen' };
			receiveTheme( theme, 'wpcom' )( spy, getState );

			expect( spy ).to.have.been.calledWith( {
				type: THEMES_REQUEST_SUCCESS,
				themes: [
					{ id: 'twentysixteen', name: 'Twenty Sixteen' },
				],
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
						options: { jetpack_version: '4.7' }
					},
				},
			},
		} );

		context( 'with a wpcom site', () => {
			const themes = [
				{ id: 'twentysixteen', name: 'Twenty Sixteen' },
				{ id: 'mood', name: 'Mood' }
			];
			const query = { search: 'Automattic' };

			it( 'should dispatch themes request success action', () => {
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

		context( 'with a Jetpack site', () => {
			const themes = [
				{ id: 'twentysixteen', name: 'Twenty Sixteen' },
				{ id: 'mood', name: 'Mood' }
			];

			it( 'should dispatch themes request success action', () => {
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
		context( 'with a wpcom site', () => {
			let nockScope;
			useNock( ( nock ) => {
				nockScope = nock( 'https://public-api.wordpress.com:443' )
					.get( '/rest/v1.2/themes' )
					.reply( 200, {
						found: 2,
						themes: [
							{ ID: 'twentysixteen', name: 'Twenty Sixteen' },
							{ ID: 'mood', name: 'Mood' }
						]
					} );
			} );

			it( 'should dispatch fetch action when thunk triggered', () => {
				requestThemes( 'wpcom' )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: THEMES_REQUEST,
					siteId: 'wpcom',
					query: {}
				} );
				expect( nockScope.isDone() ).to.be.true;
			} );
		} );

		context( 'with a Jetpack site', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.get( '/rest/v1/sites/77203074/themes' )
					.reply( 200, {
						// The endpoint doesn't return `found` for Jetpack sites
						themes: [
							{ ID: 'twentyfifteen', name: 'Twenty Fifteen' },
							{ ID: 'twentysixteen', name: 'Twenty Sixteen' }
						]
					} )
					.get( '/rest/v1/sites/1916284/themes' )
					.reply( 403, {
						error: 'authorization_required',
						message: 'User cannot access this private blog.'
					} );
			} );

			it( 'should dispatch fetch action when thunk triggered', () => {
				requestThemes( 77203074 )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: THEMES_REQUEST,
					siteId: 77203074,
					query: {}
				} );
			} );

			it( 'should dispatch fail action when request fails', () => {
				return requestThemes( 1916284 )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: THEMES_REQUEST_FAILURE,
						siteId: 1916284,
						query: {},
						error: sinon.match( { message: 'User cannot access this private blog.' } )
					} );
				} );
			} );
		} );

		context( 'with the WP.org API', () => {
			useNock( ( nock ) => {
				nock( 'https://api.wordpress.org' )
					.persist()
					.defaultReplyHeaders( {
						'Content-Type': 'application/json'
					} )
					.get( '/themes/info/1.1/?action=query_themes&request%5Bfields%5D%5Bextended_author%5D=true' )
					.reply( 200, {
						info: { page: 1, pages: 123, results: 2452 },
						themes: [
							{ slug: 'bizprime', name: 'bizprime' },
							{ slug: 'shapely', name: 'Shapely' },
							{ slug: 'cassions', name: 'Cassions' },
							{ slug: 'intentionally-blank', name: 'Intentionally Blank' }
						]
					} );
			} );

			it( 'should dispatch fetch action when thunk triggered', () => {
				requestThemes( 'wporg' )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: THEMES_REQUEST,
					siteId: 'wporg',
					query: {}
				} );
			} );
		} );
	} );

	describe( '#requestTheme()', () => {
		context( 'with a wpcom site', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.2/themes/twentysixteen' )
					.reply( 200, { id: 'twentysixteen', name: 'Twenty Sixteen' } )
					.get( '/rest/v1.2/themes/twentyumpteen' )
					.reply( 404, {
						error: 'unknown_theme',
						message: 'Unknown theme'
					} );
			} );

			it( 'should dispatch request action when thunk triggered', () => {
				requestTheme( 'twentysixteen', 'wpcom' )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: THEME_REQUEST,
					siteId: 'wpcom',
					themeId: 'twentysixteen'
				} );
			} );

			it( 'should dispatch themes request success action when request completes', () => {
				return requestTheme( 'twentysixteen', 'wpcom' )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: THEME_REQUEST_SUCCESS,
						siteId: 'wpcom',
						themeId: 'twentysixteen'
					} );
				} );
			} );

			it( 'should dispatch fail action when request fails', () => {
				return requestTheme( 'twentyumpteen', 'wpcom' )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: THEME_REQUEST_FAILURE,
						siteId: 'wpcom',
						themeId: 'twentyumpteen',
						error: sinon.match( { message: 'Unknown theme' } )
					} );
				} );
			} );
		} );

		context( 'with a Jetpack site', () => {
			// see lib/wpcom-undocumented/lib/undocumented#jetpackThemeDetails
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/sites/77203074/themes', { themes: 'twentyfifteen' } )
					.reply( 200, { themes: [ { id: 'twentyfifteen', name: 'Twenty Fifteen' } ] } )
					.post( '/rest/v1.1/sites/77203074/themes', { themes: 'twentyumpteen' } )
					.reply( 404, {
						error: 'unknown_theme',
						message: 'Unknown theme'
					} );
			} );

			it( 'should dispatch request action when thunk triggered', () => {
				requestTheme( 'twentyfifteen', 77203074 )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: THEME_REQUEST,
					siteId: 77203074,
					themeId: 'twentyfifteen'
				} );
			} );

			it( 'should dispatch themes request success action when request completes', () => {
				return requestTheme( 'twentyfifteen', 77203074 )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: THEME_REQUEST_SUCCESS,
						siteId: 77203074,
						themeId: 'twentyfifteen'
					} );
				} );
			} );

			it( 'should dispatch fail action when request fails', () => {
				return requestTheme( 'twentyumpteen', 77203074 )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: THEME_REQUEST_FAILURE,
						siteId: 77203074,
						themeId: 'twentyumpteen',
						error: sinon.match( { message: 'Unknown theme' } )
					} );
				} );
			} );
		} );

		context( 'with the WP.org API', () => {
			useNock( ( nock ) => {
				nock( 'https://api.wordpress.org' )
					.persist()
					.defaultReplyHeaders( {
						'Content-Type': 'application/json'
					} )
					.get( '/themes/info/1.1/?action=theme_information&request%5Bfields%5D%5Bextended_author%5D=true' +
						'&request%5Bslug%5D=twentyseventeen' )
					.reply( 200, { slug: 'twentyseventeen', name: 'Twenty Seventeen' } )
					.get( '/themes/info/1.1/?action=theme_information&request%5Bfields%5D%5Bextended_author%5D=true' +
						'&request%5Bslug%5D=twentyumpteen' )
					.reply( 200, false );
			} );

			it( 'should dispatch request action when thunk triggered', () => {
				requestTheme( 'twentyseventeen', 'wporg' )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: THEME_REQUEST,
					siteId: 'wporg',
					themeId: 'twentyseventeen'
				} );
			} );

			it( 'should dispatch themes request success action when request completes', () => {
				return requestTheme( 'twentyseventeen', 'wporg' )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: THEME_REQUEST_SUCCESS,
						siteId: 'wporg',
						themeId: 'twentyseventeen'
					} );
				} );
			} );

			it( 'should dispatch fail action when request fails', () => {
				return requestTheme( 'twentyumpteen', 'wporg' )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: THEME_REQUEST_FAILURE,
						siteId: 'wporg',
						themeId: 'twentyumpteen',
						error: sinon.match( 'not found' )
					} );
				} );
			} );
		} );
	} );

	describe( '#themeActivated()', () => {
		it( 'should return an action object', () => {
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
							type: 'ANALYTICS_EVENT_RECORD'
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
						2211667: 'twentyfifteen'
					},
					lastQuery: {
						2211667: {
							search: 'simple, white'
						}
					}
				}
			} );

			themeActivated( 'pub/twentysixteen', 2211667 )( spy, fakeGetState );
			expect( spy ).to.have.been.calledWith( expectedActivationSuccess );
		} );
	} );

	describe( '#clearActivated()', () => {
		it( 'should return an action object', () => {
			const action = clearActivated( 22116677 );
			expect( action ).to.eql( {
				type: THEME_CLEAR_ACTIVATED,
				siteId: 22116677
			} );
		} );
	} );

	describe( '#activateTheme()', () => {
		const trackingData = {
			theme: 'twentysixteen',
			previous_theme: 'twentyfifteen',
			source: 'unknown',
			purchased: false,
			search_term: 'simple, white'
		};

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/2211667/themes/mine', { theme: 'twentysixteen' } )
				.reply( 200, { id: 'karuna', version: '1.0.3' } )
				.post( '/rest/v1.1/sites/2211667/themes/mine', { theme: 'badTheme' } )
				.reply( 404, {
					error: 'theme_not_found',
					message: 'The specified theme was not found'
				} );
		} );

		it( 'should dispatch request action when thunk is triggered', () => {
			activateTheme( 'twentysixteen', 2211667 )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: THEME_ACTIVATE,
				siteId: 2211667,
				themeId: 'twentysixteen',
			} );
		} );

		it( 'should dispatch theme activation success thunk when request completes', () => {
			return activateTheme( 'twentysixteen', 2211667, trackingData )( spy ).then( () => {
				expect( spy.secondCall.args[ 0 ].name ).to.equal( 'themeActivatedThunk' );
			} );
		} );

		it( 'should dispatch theme activation failure action when request completes', () => {
			const themeActivationFailure = {
				error: sinon.match( { message: 'The specified theme was not found' } ),
				siteId: 2211667,
				themeId: 'badTheme',
				type: THEME_ACTIVATE_FAILURE
			};

			return activateTheme( 'badTheme', 2211667, trackingData )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( themeActivationFailure );
			} );
		} );
	} );

	describe( '#installAndActivateTheme', () => {
		const stub = sinon.stub();
		stub.returns( new Promise( ( res ) => {
			res();
		} ) );

		it( 'should dispatch installTheme() and activateTheme()', ( done ) => {
			installAndActivateTheme( 'karuna-wpcom', 2211667 )( stub ).then( () => {
				expect( stub ).to.have.been.calledWith( matchFunction( installTheme( 'karuna-wpcom', 2211667 ) ) );
				expect( stub ).to.have.been.calledWith( matchFunction( activateTheme( 'karuna-wpcom', 2211667 ) ) );
				done();
			} );
		} );
	} );

	describe( '#activate', () => {
		const stub = sinon.stub();
		stub.returns( new Promise( ( res ) => {
			res();
		} ) );

		context( 'on a WordPress.com site', () => {
			stub.reset();
			const fakeGetState = () => ( {
				sites: {
					items: {
						77203074: {
							jetpack: false
						}
					}
				}
			} );
			it( 'should dispatch (only) activateTheme() and pass the unsuffixed themeId', ( done ) => {
				activate( 'karuna', 77203074 )( stub, fakeGetState ).then( () => {
					expect( stub ).to.have.been.calledWith( matchFunction( activateTheme( 'karuna', 77203074 ) ) );
					expect( stub ).to.not.have.been.calledWith( matchFunction( installAndActivateTheme( 'karuna-wpcom', 77203074 ) ) );
					done();
				} );
			} );
		} );

		context( 'on a Jetpack site', () => {
			const sitesState = {
				sites: {
					items: {
						2211667: {
							jetpack: true
						}
					}
				}
			};
			context( 'if the theme is already installed', () => {
				stub.reset();
				const fakeGetState = () => ( {
					...sitesState,
					themes: {
						queries: {
							2211667: new ThemeQueryManager( {
								items: { karuna: {} }
							} )
						}
					}
				} );
				it( 'should dispatch (only) activateTheme() and pass the unsuffixed themeId', ( done ) => {
					activate( 'karuna', 2211667 )( stub, fakeGetState ).then( () => {
						expect( stub ).to.have.been.calledWith( matchFunction( activateTheme( 'karuna', 2211667 ) ) );
						expect( stub ).to.not.have.been.calledWith( matchFunction( installAndActivateTheme( 'karuna-wpcom', 2211667 ) ) );
						done();
					} );
				} );
			} );

			context( 'if the theme isn\'t installed', () => {
				stub.reset();
				const fakeGetState = () => ( {
					...sitesState,
					themes: {
						queries: {}
					}
				} );
				it( 'should dispatch (only) installAndActivateTheme() and pass the suffixed themeId', ( done ) => {
					activate( 'karuna', 2211667 )( stub, fakeGetState ).then( () => {
						expect( stub ).to.not.have.been.calledWith( matchFunction( activate( 'karuna', 2211667 ) ) );
						expect( stub ).to.have.been.calledWith( matchFunction( installAndActivateTheme( 'karuna-wpcom', 2211667 ) ) );
						done();
					} );
				} );
			} );
		} );
	} );

	describe( '#requestActiveTheme', () => {
		const successResponse = {
			id: 'rebalance',
			screenshot: 'https://i0.wp.com/s0.wp.com/wp-content/themes/pub/rebalance/screenshot.png?ssl=1',
			cost: {
				currency: 'USD',
				number: 0,
				display: ''
			},
			version: '1.1.1',
			download_url: 'https://public-api.wordpress.com/rest/v1/themes/download/rebalance.zip',
			trending_rank: 17,
			popularity_rank: 183,
			launch_date: '2016-05-13',
			name: 'Rebalance',
			description: 'Rebalance is a new spin on the classic ' +
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
				'translation-ready'
			],
			preview_url: 'https://unittest.wordpress.com/?theme=pub/rebalance&hide_banners=true'
		};

		const failureResponse = {
			status: 404,
			code: 'unknown_blog',
			message: 'Unknown blog'
		};

		const fakeGetState = () => ( {
			sites: {
				items: {
					77203074: {
						jetpack: true
					}
				}
			}
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

		it( 'should dispatch active theme request action when triggered', () => {
			requestActiveTheme( 2211667 )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: ACTIVE_THEME_REQUEST,
				siteId: 2211667,
			} );
		} );

		context( 'when request completes successfully', () => {
			it( 'should dispatch active theme request success action', () => {
				return requestActiveTheme( 2211667 )( spy, fakeGetState ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: ACTIVE_THEME_REQUEST_SUCCESS,
						siteId: 2211667,
						theme: successResponse
					} );
				} );
			} );
		} );

		it( 'should dispatch active theme request failure action when request completes', () => {
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
				.get( `/rest/v1.1/sites/${ siteId }/automated-transfers/status/2` ).thrice()
				.reply( 200, { status: 'stuck', message: 'jammed' } )
				.get( `/rest/v1.1/sites/${ siteId }/automated-transfers/status/3` ).twice()
				.reply( 200, { status: 'progress', message: 'in progress' } )
				.get( `/rest/v1.1/sites/${ siteId }/automated-transfers/status/3` )
				.reply( 200, { status: 'complete', message: 'all done', uploaded_theme_slug: 'mood' } )
				.get( `/rest/v1.1/sites/${ siteId }/automated-transfers/status/4` )
				.reply( 400, 'something wrong' );
		} );

		it( 'should dispatch success on status complete', () => {
			return pollThemeTransferStatus( siteId, 1 )( spy ).then( () => {
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

		it( 'should time-out if status never complete', () => {
			return pollThemeTransferStatus( siteId, 2, 10, 25 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: THEME_TRANSFER_STATUS_FAILURE,
					siteId,
					transferId: 2,
					error: 'client timeout',
				} );
			} );
		} );

		it( 'should dispatch status update', () => {
			return pollThemeTransferStatus( siteId, 3, 20 )( spy ).then( () => {
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

		it( 'should dispatch failure on receipt of error', () => {
			return pollThemeTransferStatus( siteId, 4 )( spy ).then( () => {
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
				.reply( 200, { success: true, status: 'progress', transfer_id: 1, } )
				.get( `/rest/v1.1/sites/${ siteId }/automated-transfers/initiate` )
				.reply( 400, 'some problem' );
		} );

		it( 'should dispatch success', () => {
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

		it( 'should dispatch failure on error', () => {
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
					wpcom: new ThemeQueryManager()
				}
			}
		} );

		const successResponse = {
			id: 'karuna-wpcom',
			screenshot: '//i0.wp.com/budzanowski.wpsandbox.me/wp-content/themes/karuna-wpcom/screenshot.png',
			active: false,
			name: 'Karuna',
			theme_uri: 'https://wordpress.com/themes/karuna/',
			description: 'Karuna is a clean business theme designed with health and wellness-focused sites in mind.' +
				' With bright, bold colors, prominent featured images, and support for customer testimonials',
			author: 'Automattic',
			author_uri: 'http://wordpress.com/themes/',
			version: '1.1.0',
			autoupdate: false,
			log: [
				[
					'Unpacking the package&#8230;',
					'Installing the theme&#8230;',
					'Theme installed successfully.'
				]
			]
		};

		const downloadFailureResponse = {
			status: 400,
			code: 'problem_fetching_theme',
			message: 'Problem downloading theme'
		};

		const alreadyInstalledFailureResponse = {
			status: 400,
			code: 'theme_already_installed',
			message: 'The theme is already installed'
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

		it( 'should dispatch install theme request action when triggered', () => {
			installTheme( 'karuna-wpcom', 2211667 )( spy, getState );

			expect( spy ).to.have.been.calledWith( {
				type: THEME_INSTALL,
				siteId: 2211667,
				themeId: 'karuna-wpcom'
			} );
		} );

		it( 'should dispatch wpcom theme install request success action when request completes', () => {
			return installTheme( 'karuna-wpcom', 2211667 )( spy, getState ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: THEME_INSTALL_SUCCESS,
					siteId: 2211667,
					themeId: 'karuna-wpcom',
				} );
			} );
		} );

		it( 'should dispatch wpcom theme install request failure action when theme was not found', () => {
			return installTheme( 'typist-wpcom', 2211667 )( spy, getState ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: THEME_INSTALL_FAILURE,
					siteId: 2211667,
					themeId: 'typist-wpcom',
					error: sinon.match( { message: 'Problem downloading theme' } ),
				} );
			} );
		} );

		it( 'should dispatch wpcom theme install request failure action when theme is already installed', () => {
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

		it( 'should dispatch success action on success response', () => {
			return deleteTheme( 'karuna', 2211667 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: THEME_DELETE_SUCCESS,
					siteId: 2211667,
					themeId: 'karuna',
					themeName: 'Karuna',
				} );
			} );
		} );

		it( 'should dispatch failure action on error response', () => {
			return deleteTheme( 'blahblah', 2211667 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: THEME_DELETE_FAILURE,
					siteId: 2211667,
					themeId: 'blahblah',
					error: sinon.match.truthy,
				} );
			} );
		} );
	} );

	describe( '#tryAndCustomizeTheme', () => {
		const pageSpy = sinon.spy();
		const isJetpackSiteSpy = ( state, siteId ) => {
			if ( siteId === 2211667 ) {
				return true;
			}
			return false;
		};
		const getCanonicalThemeSpy = ( state, siteId, themeId ) => {
			if ( themeId === 'karuna' ) {
				return { theme: themeId };
			}
			return null;
		};

		// we import it again with different name because we want to mock functions inside.
		let _tryAndCustomize;

		useMockery( ( mockery ) => {
			mockery.registerMock( 'page', pageSpy );
			mockery.registerMock( 'state/sites/selectors', {
				isJetpackSite: isJetpackSiteSpy
			} );
			mockery.registerMock( './selectors', {
				getThemeCustomizeUrl: () => 'customizer/url',
				getCanonicalTheme: getCanonicalThemeSpy,
			} );
			_tryAndCustomize = require( '../actions' ).tryAndCustomizeTheme;
		} );

		it( 'page should be called, when theme is available', () => {
			_tryAndCustomize( 'karuna-wpcom', 2211667 )( spy, () => {} );
			expect( pageSpy.calledWith( 'customizer/url' ) ).to.be.true;
		} );
	} );

	describe( '#installAndTryAndCustomizeTheme', () => {
		const stub = sinon.stub();
		stub.returns( new Promise( ( res ) => {
			res();
		} ) );

		it( 'should dispatch installTheme(), and tryAndCustomizeTheme()', ( done ) => {
			installAndTryAndCustomizeTheme( 'karuna-wpcom', 2211667 )( stub ).then( () => {
				expect( stub ).to.have.been.calledWith( matchFunction( installTheme( 'karuna-wpcom', 2211667 ) ) );
				expect( stub ).to.have.been.calledWith( matchFunction( tryAndCustomizeTheme( 'karuna-wpcom', 2211667 ) ) );
				done();
			} );
		} );
	} );

	describe( '#tryAndCustomize', () => {
		const stub = sinon.stub();
		stub.returns( new Promise( ( res ) => {
			res();
		} ) );

		context( 'on a WordPress.com site', () => {
			stub.reset();
			const fakeGetState = () => ( {
				sites: {
					items: {
						77203074: {
							jetpack: false
						}
					}
				}
			} );
			it( 'should dispatch (only) activateTheme() and pass the unsuffixed themeId', ( done ) => {
				tryAndCustomize( 'karuna', 77203074 )( stub, fakeGetState ).then( () => {
					expect( stub ).to.have.been.calledWith( matchFunction( tryAndCustomizeTheme( 'karuna', 77203074 ) ) );
					expect( stub ).to.not.have.been.calledWith( matchFunction(
						installAndTryAndCustomizeTheme( 'karuna-wpcom', 77203074 )
					) );
					done();
				} );
			} );
		} );

		context( 'on a Jetpack site', () => {
			const sitesState = {
				sites: {
					items: {
						2211667: {
							jetpack: true
						}
					}
				}
			};
			context( 'if the theme is already installed', () => {
				stub.reset();
				const fakeGetState = () => ( {
					...sitesState,
					themes: {
						queries: {
							2211667: new ThemeQueryManager( {
								items: { karuna: {} }
							} )
						}
					}
				} );
				it( 'should dispatch (only) tryAndCustomizeTheme() and pass the unsuffixed themeId', ( done ) => {
					tryAndCustomize( 'karuna', 2211667 )( stub, fakeGetState ).then( () => {
						expect( stub ).to.have.been.calledWith( matchFunction( tryAndCustomizeTheme( 'karuna', 2211667 ) ) );
						expect( stub ).to.not.have.been.calledWith( matchFunction(
							installAndTryAndCustomizeTheme( 'karuna-wpcom', 2211667 )
						) );
						done();
					} );
				} );
			} );

			context( 'if the theme isn\'t installed', () => {
				stub.reset();
				const fakeGetState = () => ( {
					...sitesState,
					themes: {
						queries: {}
					}
				} );
				it( 'should dispatch (only) installAndTryAndCustomizeTheme() and pass the suffixed themeId', ( done ) => {
					tryAndCustomize( 'karuna', 2211667 )( stub, fakeGetState ).then( () => {
						expect( stub ).to.not.have.been.calledWith( matchFunction( tryAndCustomize( 'karuna', 2211667 ) ) );
						expect( stub ).to.have.been.calledWith( matchFunction(
							installAndTryAndCustomizeTheme( 'karuna-wpcom', 2211667 )
						) );
						done();
					} );
				} );
			} );
		} );
	} );

	describe( '#requestThemeFilters', () => {
		it( 'should return THEME_FILTERS_REQUEST action', () => {
			const action = requestThemeFilters();
			expect( action ).to.deep.equal( { type: THEME_FILTERS_REQUEST } );
		} );
	} );
} );
