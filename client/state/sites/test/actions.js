import {
	SITE_RECEIVE,
	SITE_REQUEST,
	SITE_REQUEST_FAILURE,
	SITE_REQUEST_SUCCESS,
	SITES_RECEIVE,
	SITES_REQUEST,
	SITES_REQUEST_FAILURE,
	SITES_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import useNock from 'calypso/test-helpers/use-nock';
import { deleteSite, receiveSite, receiveSites, requestSites, requestSite } from '../actions';

describe( 'actions', () => {
	const mySitesPath =
		'/rest/v1.1/me/sites?site_visibility=all&include_domain_only=true&site_activity=active';
	let spy;

	beforeEach( () => {
		spy = jest.fn();
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
