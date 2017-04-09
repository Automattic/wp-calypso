/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	JETPACK_JUMPSTART_ACTIVATE,
	JETPACK_JUMPSTART_ACTIVATE_SUCCESS,
	JETPACK_JUMPSTART_ACTIVATE_FAILURE,
	JETPACK_JUMPSTART_DEACTIVATE,
	JETPACK_JUMPSTART_DEACTIVATE_SUCCESS,
	JETPACK_JUMPSTART_DEACTIVATE_FAILURE,
	JETPACK_JUMPSTART_STATUS_RECEIVE,
	JETPACK_JUMPSTART_STATUS_REQUEST,
	JETPACK_JUMPSTART_STATUS_REQUEST_SUCCESS,
	JETPACK_JUMPSTART_STATUS_REQUEST_FAILURE
} from 'state/action-types';
import { activateJumpstart, deactivateJumpstart, requestJumpstartStatus } from '../actions';
import { useSandbox } from 'test/helpers/use-sinon';
import useNock from 'test/helpers/use-nock';

describe( 'actions', () => {
	const siteId = 12345678;
	let spy;
	useSandbox( ( sandbox ) => spy = sandbox.spy() );

	describe( '#activateJumpstart()', () => {
		describe( 'success', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/jetpack-blogs/' + siteId + '/rest-api/', {
						path: '/jetpack/v4/jumpstart/',
						body: JSON.stringify( { active: true } )
					} )
					.reply( 200, {}, {
						'Content-Type': 'application/json'
					} );
			} );

			it( 'should dispatch an activate action when thunk triggered', () => {
				activateJumpstart( siteId )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: JETPACK_JUMPSTART_ACTIVATE,
					siteId
				} );
			} );

			it( 'should dispatch an activate success action when request successfully completes', () => {
				return activateJumpstart( siteId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_JUMPSTART_ACTIVATE_SUCCESS,
						siteId
					} );
				} );
			} );
		} );

		describe( 'failure', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/jetpack-blogs/' + siteId + '/rest-api/', {
						path: '/jetpack/v4/jumpstart/',
						body: JSON.stringify( { active: true } )
					} )
					.reply( 400, {
						message: 'Invalid request.'
					}, {
						'Content-Type': 'application/json'
					} );
			} );

			it( 'should dispatch an activate failure action when request completes unsuccessfully', () => {
				return activateJumpstart( siteId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_JUMPSTART_ACTIVATE_FAILURE,
						siteId,
						error: 'Invalid request.'
					} );
				} );
			} );
		} );
	} );

	describe( '#deactivateJumpstart()', () => {
		describe( 'success', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/jetpack-blogs/' + siteId + '/rest-api/', {
						path: '/jetpack/v4/jumpstart/',
						body: JSON.stringify( { active: false } )
					} )
					.reply( 200, {}, {
						'Content-Type': 'application/json'
					} );
			} );

			it( 'should dispatch a deactivate action when thunk triggered', () => {
				deactivateJumpstart( siteId )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: JETPACK_JUMPSTART_DEACTIVATE,
					siteId
				} );
			} );

			it( 'should dispatch a deactivate success action when request successfully completes', () => {
				return deactivateJumpstart( siteId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_JUMPSTART_DEACTIVATE_SUCCESS,
						siteId
					} );
				} );
			} );
		} );

		describe( 'failure', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/jetpack-blogs/' + siteId + '/rest-api/', {
						path: '/jetpack/v4/jumpstart/',
						body: JSON.stringify( { active: false } )
					} )
					.reply( 400, {
						message: 'Invalid request.'
					}, {
						'Content-Type': 'application/json'
					} );
			} );

			it( 'should dispatch a deactivate failure action when request completes unsuccessfully', () => {
				return deactivateJumpstart( siteId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_JUMPSTART_DEACTIVATE_FAILURE,
						siteId,
						error: 'Invalid request.'
					} );
				} );
			} );
		} );
	} );

	describe( '#requestJumpstartStatus()', () => {
		const status = 'jumpstart_activated';
		describe( 'success', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/jetpack-blogs/' + siteId + '/rest-api/' )
					.query( {
						path: '/jetpack/v4/jumpstart/'
					} )
					.reply( 200, {
						status
					}, {
						'Content-Type': 'application/json'
					} );
			} );

			it( 'should dispatch a request jumpstart status action when thunk triggered', () => {
				requestJumpstartStatus( siteId )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: JETPACK_JUMPSTART_STATUS_REQUEST,
					siteId
				} );
			} );

			it( 'should dispatch success and receive actions when request successfully completes', () => {
				return requestJumpstartStatus( siteId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_JUMPSTART_STATUS_RECEIVE,
						siteId,
						status,
					} );

					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_JUMPSTART_STATUS_REQUEST_SUCCESS,
						siteId
					} );
				} );
			} );
		} );

		describe( 'failure', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/jetpack-blogs/' + siteId + '/rest-api/' )
					.query( {
						path: '/jetpack/v4/jumpstart/'
					} )
					.reply( 400, {
						message: 'Invalid request.'
					}, {
						'Content-Type': 'application/json'
					} );
			} );

			it( 'should dispatch a failure action when request completes unsuccessfully', () => {
				return requestJumpstartStatus( siteId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_JUMPSTART_STATUS_REQUEST_FAILURE,
						siteId,
						error: 'Invalid request.'
					} );
				} );
			} );
		} );
	} );
} );
