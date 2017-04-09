/**
 * External dependencies
 */
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';
import {
	SITE_SETTINGS_RECEIVE,
	SITE_SETTINGS_REQUEST,
	SITE_SETTINGS_REQUEST_FAILURE,
	SITE_SETTINGS_REQUEST_SUCCESS,
	SITE_SETTINGS_SAVE,
	SITE_SETTINGS_SAVE_FAILURE,
	SITE_SETTINGS_SAVE_SUCCESS,
	SITE_SETTINGS_UPDATE
} from 'state/action-types';
import {
	receiveSiteSettings,
	requestSiteSettings,
	saveSiteSettings,
	updateSiteSettings
} from '../actions';

describe( 'actions', () => {
	let spy;
	useSandbox( ( sandbox ) => spy = sandbox.spy() );

	describe( 'receiveSiteSettings()', () => {
		it( 'should return an action object', () => {
			const settings = { settingKey: 'cat' };
			const action = receiveSiteSettings( 2916284, settings );

			expect( action ).to.eql( {
				type: SITE_SETTINGS_RECEIVE,
				siteId: 2916284,
				settings
			} );
		} );
	} );

	describe( 'updateSiteSettings()', () => {
		it( 'should return an action object', () => {
			const settings = { settingKey: 'cat' };
			const action = updateSiteSettings( 2916284, settings );

			expect( action ).to.eql( {
				type: SITE_SETTINGS_UPDATE,
				siteId: 2916284,
				settings
			} );
		} );
	} );

	describe( 'requestSiteSettings()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/sites/2916284/settings' )
				.reply( 200, {
					name: 'blog name',
					description: 'blog description',
					settings: { settingKey: 'cat' }
				} )
				.get( '/rest/v1.1/sites/2916285/settings' )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.'
				} );
		} );

		it( 'should dispatch fetch action when thunk triggered', () => {
			requestSiteSettings( 2916284 )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: SITE_SETTINGS_REQUEST,
				siteId: 2916284
			} );
		} );

		it( 'should dispatch receive action when request completes', () => {
			return requestSiteSettings( 2916284 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith(
					receiveSiteSettings( 2916284, {
						blogname: 'blog name',
						blogdescription: 'blog description',
						settingKey: 'cat'
					} )
				);
			} );
		} );

		it( 'should dispatch request success action when request completes', () => {
			return requestSiteSettings( 2916284 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: SITE_SETTINGS_REQUEST_SUCCESS,
					siteId: 2916284
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return requestSiteSettings( 2916285 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: SITE_SETTINGS_REQUEST_FAILURE,
					siteId: 2916285,
					error: sinon.match( { message: 'User cannot access this private blog.' } )
				} );
			} );
		} );
	} );

	describe( 'saveSiteSettings()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/2916284/settings' )
				.reply( 200, {
					updated: { real_update: 'ribs' }
				} )
				.post( '/rest/v1.1/sites/2916285/settings' )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.'
				} );
		} );

		it( 'should dispatch fetch action when thunk triggered', () => {
			saveSiteSettings( 2916284, { settingKey: 'chicken' } )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: SITE_SETTINGS_SAVE,
				siteId: 2916284
			} );
		} );

		it( 'should dispatch update action when request completes', () => {
			return saveSiteSettings( 2916284 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith(
					updateSiteSettings( 2916284, {
						real_update: 'ribs'
					} )
				);
			} );
		} );

		it( 'should dispatch save success action when request completes', () => {
			return saveSiteSettings( 2916284 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: SITE_SETTINGS_SAVE_SUCCESS,
					siteId: 2916284
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return saveSiteSettings( 2916285 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: SITE_SETTINGS_SAVE_FAILURE,
					siteId: 2916285,
					error: sinon.match( { message: 'User cannot access this private blog.' } )
				} );
			} );
		} );
	} );
} );
