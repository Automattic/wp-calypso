/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	JETPACK_MODULE_SETTINGS_RECEIVE,
	JETPACK_MODULE_SETTINGS_REQUEST,
	JETPACK_MODULE_SETTINGS_REQUEST_FAILURE,
	JETPACK_MODULE_SETTINGS_REQUEST_SUCCESS,
	JETPACK_MODULE_SETTINGS_UPDATE,
	JETPACK_MODULE_SETTINGS_UPDATE_SUCCESS,
	JETPACK_MODULE_SETTINGS_UPDATE_FAILURE
} from 'state/action-types';
import { fetchModuleSettings, updateModuleSettings } from '../actions';
import {
	moduleSettings as MODULE_SETTINGS_FIXTURE
} from './fixture';
import { useSandbox } from 'test/helpers/use-sinon';
import useNock from 'test/helpers/use-nock';

describe( 'actions', () => {
	let spy;
	useSandbox( ( sandbox ) => spy = sandbox.spy() );

	const siteId = 12345678;
	const moduleSlug = 'module-a';
	const settings = MODULE_SETTINGS_FIXTURE[ moduleSlug ];

	describe( '#fetchModuleSettings()', () => {
		describe( 'success', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/jetpack-blogs/' + siteId + '/rest-api/' )
					.query( {
						path: '/jetpack/v4/module/' + moduleSlug
					} )
					.reply( 200, { data: settings }, {
						'Content-Type': 'application/json'
					} );
			} );

			it( 'should return a fetch action object when called', () => {
				fetchModuleSettings( siteId, moduleSlug )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: JETPACK_MODULE_SETTINGS_REQUEST,
					siteId,
					moduleSlug
				} );
			} );

			it( 'should return a receive action when request successfully completes', () => {
				return fetchModuleSettings( siteId, moduleSlug )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_MODULE_SETTINGS_RECEIVE,
						siteId,
						moduleSlug,
						settings
					} );

					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_MODULE_SETTINGS_REQUEST_SUCCESS,
						siteId,
						moduleSlug,
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
						path: '/jetpack/v4/module/' + moduleSlug
					} )
					.reply( 400, {
						message: 'Invalid request.'
					}, {
						'Content-Type': 'application/json'
					} );
			} );

			it( 'should return a receive action when an error occurs', () => {
				return fetchModuleSettings( siteId, moduleSlug )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_MODULE_SETTINGS_REQUEST_FAILURE,
						siteId,
						moduleSlug,
						error: 'Invalid request.'
					} );
				} );
			} );
		} );
	} );

	describe( '#updateModuleSettings()', () => {
		describe( 'success', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/jetpack-blogs/' + siteId + '/rest-api/', {
						path: '/jetpack/v4/module/' + moduleSlug,
						body: JSON.stringify( settings )
					} )
					.reply( 200, {
						code: 'success'
					}, {
						'Content-Type': 'application/json'
					} );
			} );

			it( 'should return a fetch action object when called', () => {
				updateModuleSettings( siteId, moduleSlug, settings )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: JETPACK_MODULE_SETTINGS_UPDATE,
					siteId,
					moduleSlug,
					settings
				} );
			} );

			it( 'should return a receive action when request successfully completes', () => {
				return updateModuleSettings( siteId, moduleSlug, settings )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_MODULE_SETTINGS_UPDATE_SUCCESS,
						siteId,
						moduleSlug,
						settings
					} );
				} );
			} );
		} );

		describe( 'failure', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/jetpack-blogs/' + siteId + '/rest-api/', {
						path: '/jetpack/v4/module/' + moduleSlug,
						body: JSON.stringify( settings )
					} )
					.reply( 400, {
						message: 'Invalid option: setting_1'
					}, {
						'Content-Type': 'application/json'
					} );
			} );

			it( 'should return a receive action when an error occurs', () => {
				return updateModuleSettings( siteId, moduleSlug, settings )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_MODULE_SETTINGS_UPDATE_FAILURE,
						siteId,
						moduleSlug,
						settings,
						error: 'Invalid option: setting_1'
					} );
				} );
			} );
		} );
	} );
} );
