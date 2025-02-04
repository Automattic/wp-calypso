import {
	KEYRING_SERVICES_RECEIVE,
	KEYRING_SERVICES_REQUEST,
	KEYRING_SERVICES_REQUEST_FAILURE,
	KEYRING_SERVICES_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import useNock from 'calypso/test-helpers/use-nock';
import { requestKeyringServices } from '../actions';

describe( 'actions', () => {
	let spy;

	beforeEach( () => {
		spy = jest.fn();
	} );
	const getState = () => ( { ui: { selectedSiteId: '2916284' } } );

	describe( 'requestKeyringServices()', () => {
		describe( 'successful requests', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/wpcom/v2/sites/2916284/external-services' )
					.reply( 200, {
						services: {
							facebook: { ID: 'facebook' },
							twitter: { ID: 'twitter' },
						},
					} );
			} );

			test( 'should dispatch fetch action when thunk triggered', () => {
				requestKeyringServices()( spy, getState );

				expect( spy ).toHaveBeenCalledWith( {
					type: KEYRING_SERVICES_REQUEST,
				} );
			} );

			test( 'should dispatch keyring services receive action when request completes', () => {
				return requestKeyringServices()( spy, getState ).then( () => {
					expect( spy ).toHaveBeenCalledWith( {
						type: KEYRING_SERVICES_RECEIVE,
						services: {
							facebook: { ID: 'facebook' },
							twitter: { ID: 'twitter' },
						},
					} );
				} );
			} );

			test( 'should dispatch keyring services request success action when request completes', () => {
				return requestKeyringServices()( spy, getState ).then( () => {
					expect( spy ).toHaveBeenCalledWith( {
						type: KEYRING_SERVICES_REQUEST_SUCCESS,
					} );
				} );
			} );
		} );

		describe( 'failing requests', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/wpcom/v2/sites/2916284/external-services' )
					.reply( 500, {
						error: 'server_error',
						message: 'A server error occurred',
					} );
			} );

			test( 'should dispatch fetch action when thunk triggered', () => {
				requestKeyringServices()( spy, getState );

				expect( spy ).toHaveBeenCalledWith( {
					type: KEYRING_SERVICES_REQUEST,
				} );
			} );

			test( 'should dispatch keyring services request fail action when request fails', () => {
				return requestKeyringServices()( spy, getState ).then( () => {
					expect( spy ).toHaveBeenCalledWith( {
						type: KEYRING_SERVICES_REQUEST_FAILURE,
						error: expect.objectContaining( { message: 'A server error occurred' } ),
					} );
				} );
			} );
		} );
	} );
} );
