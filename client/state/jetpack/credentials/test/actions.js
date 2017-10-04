/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	JETPACK_CREDENTIALS_REQUEST,
	JETPACK_CREDENTIALS_REQUEST_FAILURE,
	JETPACK_CREDENTIALS_UPDATE
} from 'state/action-types';
import { fetchCredentials, updateCredentials } from '../actions';
import {
	credentials as CREDENTIALS_FIXTURE,
	normalizedCredentials as NORMALIZED_CREDENTIALS_FIXTURE
} from './fixture';
import { useSandbox } from 'test/helpers/use-sinon';
import useNock from 'test/helpers/use-nock';

describe( 'actions', () => {
	let spy;
	useSandbox( ( sandbox ) => spy = sandbox.spy() );

	const siteId = 12345678;
	const credentials = CREDENTIALS_FIXTURE;

	describe( '#fetchCredentials()', () => {
		describe( 'success', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/activity-log/' + siteId + '/get-credentials' )
					.reply( 200, { data: credentials[ siteId ] }, {
						'Content-Type': 'application/json'
					} );
			} );

			it( 'should return a fetch action object when called', () => {
				fetchCredentials( siteId )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: JETPACK_CREDENTIALS_REQUEST,
					siteId
				} );
			} );
		} );

		describe( 'failure', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/activity-log/' + siteId + '/get-credentials' )
					.reply( 400, {
						message: 'Invalid request.'
					}, {
						'Content-Type': 'application/json'
					} );
			} );

			it( 'should return a receive action when an error occurs', () => {
				return fetchCredentials( siteId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_CREDENTIALS_REQUEST_FAILURE,
						siteId,
						error: 'Invalid request.'
					} );
				} );
			} );
		} );

		describe( '#updateCredentials()', () => {
			describe( 'success', () => {
				useNock( ( nock ) => {
					nock( 'https://public-api.wordpress.com:443' )
						.persist()
						.post( '/rest/v1.1/activity-log/' + siteId + '/update-credentials', {
							body: credentials[ siteId ]
						} )
						.reply( 200, {
							code: 'success'
						}, {
							'Content-Type': 'application/json'
						} );
				} );

				it( 'should return a fetch action object when called', () => {
					updateCredentials( siteId, NORMALIZED_CREDENTIALS_FIXTURE[ siteId ] )( spy );

					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_CREDENTIALS_UPDATE,
						siteId,
						credentials: NORMALIZED_CREDENTIALS_FIXTURE[ siteId ]
					} );
				} );
			} );

			describe( 'failure', () => {
				useNock( ( nock ) => {
					nock( 'https://public-api.wordpress.com:443' )
						.persist()
						.post( '/rest/v1.1/activity-log/' + siteId + '/update-credentials', {
							body: credentials[ siteId ]
						} )
						.reply( 400, {
							message: 'Invalid credentials.'
						}, {
							'Content-Type': 'application/json'
						} );
				} );
			} );
		} );
	} );
} );
