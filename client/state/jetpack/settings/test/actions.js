/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { fetchSettings, updateSettings, regeneratePostByEmail } from '../actions';
import { filterSettingsByActiveModules } from '../utils';
import {
	settings as SETTINGS_FIXTURE,
	normalizedSettings as NORMALIZED_SETTINGS_FIXTURE,
} from './fixture';
import {
	JETPACK_SETTINGS_RECEIVE,
	JETPACK_SETTINGS_REGENERATE_POST_BY_EMAIL,
	JETPACK_SETTINGS_REGENERATE_POST_BY_EMAIL_SUCCESS,
	JETPACK_SETTINGS_REGENERATE_POST_BY_EMAIL_FAILURE,
	JETPACK_SETTINGS_REQUEST,
	JETPACK_SETTINGS_REQUEST_FAILURE,
	JETPACK_SETTINGS_REQUEST_SUCCESS,
	JETPACK_SETTINGS_UPDATE,
	JETPACK_SETTINGS_UPDATE_SUCCESS,
	JETPACK_SETTINGS_UPDATE_FAILURE,
} from 'client/state/action-types';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'actions', () => {
	let spy;
	useSandbox( sandbox => ( spy = sandbox.spy() ) );

	const siteId = 12345678;
	const settings = SETTINGS_FIXTURE;

	describe( '#fetchSettings()', () => {
		describe( 'success', () => {
			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/jetpack-blogs/' + siteId + '/rest-api/' )
					.query( {
						path: '/jetpack/v4/settings/',
					} )
					.reply(
						200,
						{ data: settings[ siteId ] },
						{
							'Content-Type': 'application/json',
						}
					);
			} );

			test( 'should return a fetch action object when called', () => {
				fetchSettings( siteId )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: JETPACK_SETTINGS_REQUEST,
					siteId,
				} );
			} );

			test( 'should return a receive action when request successfully completes', () => {
				return fetchSettings( siteId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_SETTINGS_RECEIVE,
						siteId,
						settings: NORMALIZED_SETTINGS_FIXTURE[ siteId ],
					} );

					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_SETTINGS_REQUEST_SUCCESS,
						siteId,
					} );
				} );
			} );
		} );

		describe( 'failure', () => {
			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/jetpack-blogs/' + siteId + '/rest-api/' )
					.query( {
						path: '/jetpack/v4/settings/',
					} )
					.reply(
						400,
						{
							message: 'Invalid request.',
						},
						{
							'Content-Type': 'application/json',
						}
					);
			} );

			test( 'should return a receive action when an error occurs', () => {
				return fetchSettings( siteId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_SETTINGS_REQUEST_FAILURE,
						siteId,
						error: 'Invalid request.',
					} );
				} );
			} );
		} );
	} );

	describe( '#updateSettings()', () => {
		describe( 'success', () => {
			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/jetpack-blogs/' + siteId + '/rest-api/', {
						path: '/jetpack/v4/settings/',
						body: JSON.stringify( filterSettingsByActiveModules( settings[ siteId ] ) ),
					} )
					.reply(
						200,
						{
							code: 'success',
						},
						{
							'Content-Type': 'application/json',
						}
					);
			} );

			test( 'should return a fetch action object when called', () => {
				updateSettings( siteId, NORMALIZED_SETTINGS_FIXTURE[ siteId ] )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: JETPACK_SETTINGS_UPDATE,
					siteId,
					settings: NORMALIZED_SETTINGS_FIXTURE[ siteId ],
				} );
			} );

			test( 'should return a receive action when request successfully completes', () => {
				return updateSettings( siteId, NORMALIZED_SETTINGS_FIXTURE[ siteId ] )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_SETTINGS_UPDATE_SUCCESS,
						siteId,
						settings: NORMALIZED_SETTINGS_FIXTURE[ siteId ],
					} );
				} );
			} );
		} );

		describe( 'failure', () => {
			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/jetpack-blogs/' + siteId + '/rest-api/', {
						path: '/jetpack/v4/settings/',
						body: JSON.stringify( filterSettingsByActiveModules( settings[ siteId ] ) ),
					} )
					.reply(
						400,
						{
							message: 'Invalid option: setting_1',
						},
						{
							'Content-Type': 'application/json',
						}
					);
			} );

			test( 'should return a receive action when an error occurs', () => {
				return updateSettings( siteId, NORMALIZED_SETTINGS_FIXTURE[ siteId ] )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_SETTINGS_UPDATE_FAILURE,
						siteId,
						settings: NORMALIZED_SETTINGS_FIXTURE[ siteId ],
						error: 'Invalid option: setting_1',
					} );
				} );
			} );
		} );
	} );

	describe( '#regeneratePostByEmail()', () => {
		describe( 'success', () => {
			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/jetpack-blogs/' + siteId + '/rest-api/', {
						path: '/jetpack/v4/settings/',
						body: JSON.stringify( { post_by_email_address: 'regenerate' } ),
					} )
					.reply(
						200,
						{
							data: {
								post_by_email_address: 'example123456@automattic.com',
							},
						},
						{
							'Content-Type': 'application/json',
						}
					);
			} );

			test( 'should return a regenerate action object when called', () => {
				regeneratePostByEmail( siteId )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: JETPACK_SETTINGS_REGENERATE_POST_BY_EMAIL,
					siteId,
				} );
			} );

			test( 'should return a receive action when request successfully completes', () => {
				return regeneratePostByEmail( siteId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_SETTINGS_REGENERATE_POST_BY_EMAIL_SUCCESS,
						siteId,
						email: 'example123456@automattic.com',
					} );
				} );
			} );
		} );

		describe( 'failure', () => {
			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/jetpack-blogs/' + siteId + '/rest-api/', {
						path: '/jetpack/v4/settings/',
						body: JSON.stringify( { post_by_email_address: 'regenerate' } ),
					} )
					.reply(
						400,
						{
							message: 'Invalid request.',
						},
						{
							'Content-Type': 'application/json',
						}
					);
			} );

			test( 'should return a receive action when an error occurs', () => {
				return regeneratePostByEmail( siteId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_SETTINGS_REGENERATE_POST_BY_EMAIL_FAILURE,
						siteId,
						error: 'Invalid request.',
					} );
				} );
			} );
		} );
	} );
} );
