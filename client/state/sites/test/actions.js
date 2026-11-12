import { applyMiddleware, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import {
	ANALYTICS_EVENT_RECORD,
	NOTICE_CREATE,
	SITE_LEAVE_RECEIVE,
	SITE_RECEIVE,
	SITE_REQUEST,
	SITE_REQUEST_FAILURE,
	SITE_REQUEST_SUCCESS,
	SITES_RECEIVE,
	SITES_REQUEST,
	SITES_REQUEST_FAILURE,
	SITES_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import * as currentUserActions from 'calypso/state/current-user/actions';
import useNock from 'calypso/test-helpers/use-nock';
import {
	deleteSite,
	leaveSite,
	receiveSite,
	receiveSites,
	requestSites,
	requestSite,
} from '../actions';

describe( 'actions', () => {
	const mySitesPath =
		'/rest/v1.1/me/sites?site_visibility=all&include_domain_only=true&site_activity=active';
	let spy;

	beforeEach( () => {
		spy = jest.fn();
	} );

	describe( '#leaveSite()', () => {
		let backendStatus;
		let backendBody;

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com' )
				.post( '/rest/v1.1/sites/123/users/5/delete' )
				.times( 3 )
				.query( true )
				.reply( () => [ backendStatus, backendBody ] );
		} );

		afterEach( () => jest.restoreAllMocks() );

		test.each( [
			[
				'confirmed removal',
				200,
				{ success: true },
				true,
				'success',
				'is-success',
				'You have left example.wordpress.com successfully.',
			],
			[
				'unsuccessful removal',
				200,
				{ success: false },
				false,
				'failure',
				'is-error',
				'Failed to leave the site. Please try again.',
			],
			[
				'rejected removal',
				409,
				{ error: 'site_owner_unavailable', message: 'No verified site owner.' },
				false,
				'failure',
				'is-error',
				'No verified site owner.',
			],
		] )(
			'handles %s through Redux without interrupting the result',
			async ( _case, status, body, success, event, noticeStatus, message ) => {
				backendStatus = status;
				backendBody = body;
				jest
					.spyOn( currentUserActions, 'fetchCurrentUser' )
					.mockReturnValue( { type: 'TEST_CURRENT_USER_REFRESH' } );
				const actions = [];
				const recordActions = () => ( next ) => ( action ) => {
					actions.push( action );
					return next( action );
				};
				const initialState = {
					sites: {
						items: {
							123: {
								ID: 123,
								URL: 'https://example.wordpress.com',
								domain: 'example.wordpress.com',
								slug: 'example.wordpress.com',
							},
						},
					},
					currentUser: { capabilities: { 123: { manage_options: true } } },
				};
				const store = createStore(
					( state ) => state,
					initialState,
					applyMiddleware( thunk, recordActions )
				);

				await expect( store.dispatch( leaveSite( 123, 5 ) ) ).resolves.toBe( success );
				expect( actions.some( ( action ) => action.type === SITE_LEAVE_RECEIVE ) ).toBe( success );
				expect( actions.filter( ( action ) => action.type === NOTICE_CREATE ) ).toEqual( [
					expect.objectContaining( {
						notice: expect.objectContaining( { status: noticeStatus, text: message } ),
					} ),
				] );
				expect( actions.filter( ( action ) => action.type === ANALYTICS_EVENT_RECORD ) ).toEqual( [
					expect.objectContaining( {
						meta: {
							analytics: [
								{
									type: ANALYTICS_EVENT_RECORD,
									payload: {
										service: 'tracks',
										name: `calypso_leave_blog_${ event }`,
										properties: { site_id: 123, is_admin: true },
									},
								},
							],
						},
					} ),
				] );
			}
		);
	} );

	describe( '#receiveSite()', () => {
		test( 'should return an action object', () => {
			const site = { ID: 2916284, name: 'WordPress.com Example Blog' };
			const action = receiveSite( site );

			expect( action ).toEqual( {
				type: SITE_RECEIVE,
				site,
			} );
		} );
	} );

	describe( '#receiveSites()', () => {
		test( 'should return an action object', () => {
			const sites = [
				{ ID: 2916284, name: 'WordPress.com Example Blog' },
				{ ID: 77203074, name: 'WordPress.com Example Blog 2' },
			];
			const action = receiveSites( sites );
			expect( action ).toEqual( {
				type: SITES_RECEIVE,
				sites,
			} );
		} );
	} );

	describe( '#requestSites()', () => {
		describe( 'success', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.filteringPath( () => mySitesPath )
					.get( mySitesPath )
					.reply( 200, {
						sites: [
							{ ID: 2916284, name: 'WordPress.com Example Blog' },
							{ ID: 77203074, name: 'WordPress.com Example Blog 2' },
						],
					} );
			} );

			test( 'should dispatch request action when thunk triggered', () => {
				requestSites()( spy );
				expect( spy ).toHaveBeenCalledWith( { type: SITES_REQUEST } );
			} );

			test( 'should dispatch receive action when request completes', async () => {
				await requestSites()( spy );
				expect( spy ).toHaveBeenCalledWith( {
					type: SITES_RECEIVE,
					sites: [
						{ ID: 2916284, name: 'WordPress.com Example Blog' },
						{ ID: 77203074, name: 'WordPress.com Example Blog 2' },
					],
				} );
			} );

			test( 'should dispatch success action when request completes', async () => {
				await requestSites()( spy );
				expect( spy ).toHaveBeenCalledWith( { type: SITES_REQUEST_SUCCESS } );
			} );
		} );

		describe( 'failure', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.filteringPath( () => mySitesPath )
					.get( mySitesPath )
					.reply( 403, {
						error: 'authorization_required',
						message: 'An active access token must be used to access sites.',
					} );
			} );

			test( 'should dispatch fail action when request fails', async () => {
				await requestSites()( spy );
				expect( spy ).toHaveBeenCalledWith( {
					type: SITES_REQUEST_FAILURE,
					error: expect.objectContaining( {
						message: 'An active access token must be used to access sites.',
					} ),
				} );
			} );
		} );

		describe( 'Jetpack Cloud site filtering', () => {
			let isJetpackCloudMock;

			beforeEach( () => {
				isJetpackCloudMock = jest.spyOn(
					require( 'calypso/lib/jetpack/is-jetpack-cloud' ),
					'default'
				);
			} );

			afterEach( () => {
				isJetpackCloudMock.mockRestore();
			} );

			describe( 'when in Jetpack Cloud', () => {
				useNock( ( nock ) => {
					nock( 'https://public-api.wordpress.com:443' )
						.persist()
						.filteringPath( () => mySitesPath )
						.get( mySitesPath )
						.reply( 200, {
							sites: [
								{ ID: 1, name: 'Regular Site', jetpack: true },
								{ ID: 2, name: 'Garden Site', is_garden: true, jetpack: true },
								{ ID: 3, name: 'Another Regular Site', jetpack: true },
								{ ID: 4, name: 'P2 Site', jetpack: true, options: { is_wpforteams_site: true } },
								{
									ID: 5,
									name: 'Simple Non-Classic',
									options: { wpcom_admin_interface: 'calypso' },
								},
							],
						} );
				} );

				test( 'should filter out garden sites', async () => {
					isJetpackCloudMock.mockReturnValue( true );

					await requestSites()( spy );

					expect( spy ).toHaveBeenCalledWith( {
						type: SITES_RECEIVE,
						sites: [
							{ ID: 1, name: 'Regular Site', jetpack: true },
							{ ID: 3, name: 'Another Regular Site', jetpack: true },
						],
					} );
				} );

				test( 'should filter out P2 sites', async () => {
					isJetpackCloudMock.mockReturnValue( true );

					await requestSites()( spy );

					const receivedCall = spy.mock.calls.find(
						( call ) => call[ 0 ].type === 'SITES_RECEIVE'
					);
					const receivedSites = receivedCall[ 0 ].sites;

					expect( receivedSites.some( ( site ) => site.ID === 4 ) ).toBe( false );
				} );

				test( 'should filter out Simple non-Classic sites', async () => {
					isJetpackCloudMock.mockReturnValue( true );

					await requestSites()( spy );

					const receivedCall = spy.mock.calls.find(
						( call ) => call[ 0 ].type === 'SITES_RECEIVE'
					);
					const receivedSites = receivedCall[ 0 ].sites;

					expect( receivedSites.some( ( site ) => site.ID === 5 ) ).toBe( false );
				} );
			} );

			describe( 'when not in Jetpack Cloud', () => {
				useNock( ( nock ) => {
					nock( 'https://public-api.wordpress.com:443' )
						.persist()
						.filteringPath( () => mySitesPath )
						.get( mySitesPath )
						.reply( 200, {
							sites: [
								{ ID: 1, name: 'Regular Site', jetpack: true },
								{ ID: 2, name: 'Garden Site', is_garden: true, jetpack: true },
							],
						} );
				} );

				test( 'should include garden sites', async () => {
					isJetpackCloudMock.mockReturnValue( false );

					await requestSites()( spy );

					expect( spy ).toHaveBeenCalledWith( {
						type: SITES_RECEIVE,
						sites: [
							{ ID: 1, name: 'Regular Site', jetpack: true },
							{ ID: 2, name: 'Garden Site', is_garden: true, jetpack: true },
						],
					} );
				} );
			} );
		} );
	} );

	describe( 'requestSite()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.2/sites/2916284' )
				.reply( 200, {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
					capabilities: {},
				} )
				.get( '/rest/v1.2/sites/77203074' )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.',
				} )
				.get( '/rest/v1.2/sites/8894098' )
				.reply( 200, {
					ID: 8894098,
					name: 'Some random site I dont have access to',
				} )
				.get( '/rest/v1.2/sites/123456789' )
				.query( { force: 'wpcom' } )
				.reply( 200, {
					ID: 123456789,
					name: 'Jetpack Missing Core Test Site',
					capabilities: {},
				} )
				.get( '/rest/v1.2/sites/123456789' )
				.reply( 400, {
					error: 'jetpack_not_found',
					message:
						'The Jetpack site is inaccessible or returned an error: server error. requested method jetpack.jsonAPI does not exist.',
				} )
				.get( '/rest/v1.2/sites/987654321' )
				.query( { force: 'wpcom' } )
				.reply( 200, {
					ID: 987654321,
					name: 'Jetpack Fatal Error Test Site',
					capabilities: {},
				} )
				.get( '/rest/v1.2/sites/987654321' )
				.reply( 400, {
					error: 'server_error',
					message: 'The Jetpack site is inaccessible or returned an error:  []',
				} );
		} );

		test( 'should dispatch fetch action when thunk triggered', () => {
			const site = requestSite( 2916284 )( spy, () => {} );

			expect( spy ).toHaveBeenCalledWith( {
				type: SITE_REQUEST,
				siteId: 2916284,
			} );

			return site;
		} );

		test( 'should dispatch receive site when request completes', async () => {
			await requestSite( 2916284 )( spy, () => {} );
			expect( spy ).toHaveBeenCalledWith(
				receiveSite( {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
					capabilities: {},
				} )
			);
		} );

		test( "should dispatch success and not receive action when request returns site we can't manage", async () => {
			await requestSite( 8894098 )( spy, () => {} );
			expect( spy ).not.toHaveBeenCalledWith(
				receiveSite( {
					ID: 8894098,
					name: 'WordPress.com Example Blog',
				} )
			);
			expect( spy ).toHaveBeenCalledWith( {
				type: SITE_REQUEST_SUCCESS,
				siteId: 8894098,
			} );
		} );

		test( 'should retry with force wpcom when Jetpack is missing', async () => {
			await requestSite( 123456789 )( spy, () => {} );

			expect( spy ).toHaveBeenCalledWith(
				receiveSite( {
					ID: 123456789,
					name: 'Jetpack Missing Core Test Site',
					capabilities: {},
				} )
			);
			expect( spy ).toHaveBeenCalledWith( {
				type: SITE_REQUEST_SUCCESS,
				siteId: 123456789,
			} );
		} );

		test( 'should retry with force wpcom when the Jetpack site is inaccessible', async () => {
			await requestSite( 987654321 )( spy, () => {} );

			expect( spy ).toHaveBeenCalledWith(
				receiveSite( {
					ID: 987654321,
					name: 'Jetpack Fatal Error Test Site',
					capabilities: {},
				} )
			);
			expect( spy ).toHaveBeenCalledWith( {
				type: SITE_REQUEST_SUCCESS,
				siteId: 987654321,
			} );
		} );

		test( 'should dispatch request success action when request completes', async () => {
			await requestSite( 2916284 )( spy, () => {} );
			expect( spy ).toHaveBeenCalledWith( {
				type: SITE_REQUEST_SUCCESS,
				siteId: 2916284,
			} );
		} );

		test( 'should dispatch fail action when request fails', async () => {
			await requestSite( 77203074 )( spy, () => {} ).catch( () => {} );
			expect( spy ).toHaveBeenCalledWith( {
				type: SITE_REQUEST_FAILURE,
				siteId: 77203074,
			} );
		} );
	} );

	describe( 'requestSite() DIFM pre-submit flag refetch', () => {
		const forcedOptions = {
			is_difm_lite_in_progress: true,
			difm_lite_site_options: { is_website_content_submitted: false },
		};

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				// Jetpack (Atomic) DIFM site: proxied response is missing the flag,
				// wpcom-forced response carries it.
				.get( '/rest/v1.2/sites/90001' )
				.reply( 200, {
					ID: 90001,
					jetpack: true,
					capabilities: {},
					options: { is_difm_lite_in_progress: true },
				} )
				.get( '/rest/v1.2/sites/90001' )
				.query( { force: 'wpcom' } )
				.reply( 200, {
					ID: 90001,
					jetpack: true,
					capabilities: {},
					options: forcedOptions,
				} )
				// Jetpack DIFM site where the flag is already present: no refetch
				// (a refetch would fail the test — no forced route is mocked).
				.get( '/rest/v1.2/sites/90002' )
				.reply( 200, {
					ID: 90002,
					jetpack: true,
					capabilities: {},
					options: forcedOptions,
				} )
				// Simple DIFM site: never proxied, must not be refetched.
				.get( '/rest/v1.2/sites/90003' )
				.reply( 200, {
					ID: 90003,
					jetpack: false,
					capabilities: {},
					options: { is_difm_lite_in_progress: true },
				} )
				// Jetpack DIFM site whose forced response still lacks the flag
				// (backend not deployed yet): settles after exactly one refetch.
				.get( '/rest/v1.2/sites/90004' )
				.reply( 200, {
					ID: 90004,
					jetpack: true,
					capabilities: {},
					options: { is_difm_lite_in_progress: true },
				} )
				.get( '/rest/v1.2/sites/90004' )
				.query( { force: 'wpcom' } )
				.reply( 200, {
					ID: 90004,
					jetpack: true,
					capabilities: {},
					options: { is_difm_lite_in_progress: true },
				} )
				// Jetpack DIFM site whose optional wpcom refetch fails: preserve
				// the usable proxied response and keep the pre-submit routes locked.
				.get( '/rest/v1.2/sites/90005' )
				.reply( 200, {
					ID: 90005,
					jetpack: true,
					capabilities: {},
					options: { is_difm_lite_in_progress: true },
				} )
				.get( '/rest/v1.2/sites/90005' )
				.query( { force: 'wpcom' } )
				.reply( 500, {
					error: 'server_error',
					message: 'Something went wrong.',
				} );
		} );

		test( 'refetches with force=wpcom and dispatches the wpcom-served record', async () => {
			await requestSite( 90001 )( spy, () => {} );
			expect( spy ).toHaveBeenCalledWith(
				receiveSite( {
					ID: 90001,
					jetpack: true,
					capabilities: {},
					options: forcedOptions,
				} )
			);
		} );

		test( 'does not refetch when the flag is already present', async () => {
			await requestSite( 90002 )( spy, () => {} );
			expect( spy ).toHaveBeenCalledWith(
				receiveSite( {
					ID: 90002,
					jetpack: true,
					capabilities: {},
					options: forcedOptions,
				} )
			);
			expect( spy ).toHaveBeenCalledWith( {
				type: SITE_REQUEST_SUCCESS,
				siteId: 90002,
			} );
		} );

		test( 'does not refetch for non-Jetpack (Simple) DIFM sites', async () => {
			await requestSite( 90003 )( spy, () => {} );
			expect( spy ).toHaveBeenCalledWith(
				receiveSite( {
					ID: 90003,
					jetpack: false,
					capabilities: {},
					options: { is_difm_lite_in_progress: true },
				} )
			);
		} );

		test( 'settles after exactly one refetch when the forced response still lacks the flag', async () => {
			await requestSite( 90004 )( spy, () => {} );
			expect( spy ).toHaveBeenCalledWith(
				receiveSite( {
					ID: 90004,
					jetpack: true,
					capabilities: {},
					options: { is_difm_lite_in_progress: true },
				} )
			);
			expect( spy ).toHaveBeenCalledWith( {
				type: SITE_REQUEST_SUCCESS,
				siteId: 90004,
			} );
		} );

		test( 'preserves the proxied response when the forced refetch fails', async () => {
			const site = await requestSite( 90005 )( spy, () => {} );

			expect( site ).toEqual( {
				ID: 90005,
				jetpack: true,
				capabilities: {},
				options: { is_difm_lite_in_progress: true },
			} );
			expect( spy ).toHaveBeenCalledWith( receiveSite( site ) );
			expect( spy ).toHaveBeenCalledWith( {
				type: SITE_REQUEST_SUCCESS,
				siteId: 90005,
			} );
		} );
	} );

	describe( 'deleteSite()', () => {
		const getState = () => ( {
			sites: {
				items: {},
			},
		} );
		const dispatch = ( action ) => {
			if ( typeof action === 'function' ) {
				return action( dispatch, getState );
			}
			return spy( action );
		};

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/2916284/delete' )
				.reply( 200, {
					ID: 2916284,
				} )
				.post( '/rest/v1.1/sites/77203074/delete' )
				.reply( 403, {
					error: 'unauthorized',
					message: 'User cannot delete site.',
				} );
		} );

		test( 'should dispatch receive deleted site when request completes', async () => {
			await dispatch( deleteSite( 2916284 ) );
			expect( spy ).toHaveBeenCalledWith( { type: 'SITE_DELETE_RECEIVE', siteId: 2916284 } );
		} );
	} );
} );
