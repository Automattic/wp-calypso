/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { requestKeyringServices } from '../actions';
import {
	KEYRING_SERVICES_RECEIVE,
	KEYRING_SERVICES_REQUEST,
	KEYRING_SERVICES_REQUEST_FAILURE,
	KEYRING_SERVICES_REQUEST_SUCCESS,
} from 'state/action-types';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'actions', () => {
	let spy;
	useSandbox( ( sandbox ) => ( spy = sandbox.spy() ) );
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

				expect( spy ).to.have.been.calledWith( {
					type: KEYRING_SERVICES_REQUEST,
				} );
			} );

			test( 'should dispatch keyring services receive action when request completes', () => {
				return requestKeyringServices()( spy, getState ).then( () => {
					expect( spy ).to.have.been.calledWith( {
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
					expect( spy ).to.have.been.calledWith( {
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

				expect( spy ).to.have.been.calledWith( {
					type: KEYRING_SERVICES_REQUEST,
				} );
			} );

			test( 'should dispatch keyring services request fail action when request fails', () => {
				return requestKeyringServices()( spy, getState ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: KEYRING_SERVICES_REQUEST_FAILURE,
						error: sinon.match( { message: 'A server error occurred' } ),
					} );
				} );
			} );
		} );
	} );
} );
