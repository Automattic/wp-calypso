/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	JETPACK_SETTINGS_RECEIVE,
	JETPACK_SETTINGS_REQUEST,
	JETPACK_SETTINGS_REQUEST_FAILURE,
	JETPACK_SETTINGS_REQUEST_SUCCESS,
	JETPACK_SETTINGS_UPDATE,
	JETPACK_SETTINGS_UPDATE_SUCCESS,
	JETPACK_SETTINGS_UPDATE_FAILURE
} from 'state/action-types';
import { fetchSettings, updateSettings } from '../actions';
import {
	settings as SETTINGS_FIXTURE
} from './fixture';
import { useSandbox } from 'test/helpers/use-sinon';
import useNock from 'test/helpers/use-nock';

describe( 'actions', () => {
	let spy;
	useSandbox( ( sandbox ) => spy = sandbox.spy() );

	const siteId = 12345678;
	const settings = SETTINGS_FIXTURE;

	describe( '#fetchSettings()', () => {
		describe( 'success', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/jetpack-blogs/' + siteId + '/rest-api/' )
					.query( {
						path: '/jetpack/v4/settings/'
					} )
					.reply( 200, { data: settings[ siteId ] }, {
						'Content-Type': 'application/json'
					} );
			} );

			it( 'should return a fetch action object when called', () => {
				fetchSettings( siteId )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: JETPACK_SETTINGS_REQUEST,
					siteId,
				} );
			} );

			it( 'should return a receive action when request successfully completes', () => {
				return fetchSettings( siteId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_SETTINGS_RECEIVE,
						siteId,
						settings: settings[ siteId ]
					} );

					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_SETTINGS_REQUEST_SUCCESS,
						siteId,
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
						path: '/jetpack/v4/settings/'
					} )
					.reply( 400, {
						message: 'Invalid request.'
					}, {
						'Content-Type': 'application/json'
					} );
			} );

			it( 'should return a receive action when an error occurs', () => {
				return fetchSettings( siteId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_SETTINGS_REQUEST_FAILURE,
						siteId,
						error: 'Invalid request.'
					} );
				} );
			} );
		} );
	} );

	describe( '#updateSettings()', () => {
		describe( 'success', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/jetpack-blogs/' + siteId + '/rest-api/', {
						path: '/jetpack/v4/settings/',
						body: JSON.stringify( settings[ siteId ] )
					} )
					.reply( 200, {
						code: 'success'
					}, {
						'Content-Type': 'application/json'
					} );
			} );

			it( 'should return a fetch action object when called', () => {
				updateSettings( siteId, settings[ siteId ] )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: JETPACK_SETTINGS_UPDATE,
					siteId,
					settings: settings[ siteId ]
				} );
			} );

			it( 'should return a receive action when request successfully completes', () => {
				return updateSettings( siteId, settings[ siteId ] )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_SETTINGS_UPDATE_SUCCESS,
						siteId,
						settings: settings[ siteId ]
					} );
				} );
			} );
		} );

		describe( 'failure', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/jetpack-blogs/' + siteId + '/rest-api/', {
						path: '/jetpack/v4/settings/',
						body: JSON.stringify( settings[ siteId ] )
					} )
					.reply( 400, {
						message: 'Invalid option: setting_1'
					}, {
						'Content-Type': 'application/json'
					} );
			} );

			it( 'should return a receive action when an error occurs', () => {
				return updateSettings( siteId, settings[ siteId ] )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_SETTINGS_UPDATE_FAILURE,
						siteId,
						settings: settings[ siteId ],
						error: 'Invalid option: setting_1'
					} );
				} );
			} );
		} );
	} );
} );
