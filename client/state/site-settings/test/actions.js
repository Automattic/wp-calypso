import {
	SITE_SETTINGS_RECEIVE,
	SITE_SETTINGS_REQUEST,
	SITE_SETTINGS_REQUEST_FAILURE,
	SITE_SETTINGS_REQUEST_SUCCESS,
	SITE_SETTINGS_SAVE,
	SITE_SETTINGS_SAVE_FAILURE,
	SITE_SETTINGS_SAVE_SUCCESS,
	SITE_SETTINGS_UPDATE,
} from 'calypso/state/action-types';
import useNock from 'calypso/test-helpers/use-nock';
import {
	receiveSiteSettings,
	requestSiteSettings,
	saveSiteSettings,
	updateSiteSettings,
} from '../actions';

const getState = () => ( {
	sites: {
		items: {
			2916284: {
				options: {},
				jetpack: true,
			},
		},
	},
	siteSettings: { items: { 2916284: {} } },
} );

describe( 'actions', () => {
	let spy;

	beforeEach( () => {
		spy = jest.fn();
	} );

	describe( 'receiveSiteSettings()', () => {
		test( 'should return an action object', () => {
			const settings = { settingKey: 'cat' };
			const action = receiveSiteSettings( 2916284, settings );

			expect( action ).toEqual( {
				type: SITE_SETTINGS_RECEIVE,
				siteId: 2916284,
				settings,
			} );
		} );
	} );

	describe( 'updateSiteSettings()', () => {
		test( 'should return an action object', () => {
			const settings = { settingKey: 'cat' };
			const action = updateSiteSettings( 2916284, settings );

			expect( action ).toEqual( {
				type: SITE_SETTINGS_UPDATE,
				siteId: 2916284,
				settings,
			} );
		} );
	} );

	describe( 'requestSiteSettings()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.4/sites/2916284/settings' )
				.reply( 200, {
					name: 'blog name',
					description: 'blog description',
					settings: { settingKey: 'cat' },
				} )
				.get( '/rest/v1.4/sites/2916285/settings' )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.',
				} );
		} );

		test( 'should dispatch fetch action when thunk triggered', () => {
			requestSiteSettings( 2916284 )( spy, getState );

			expect( spy ).toHaveBeenCalledWith( {
				type: SITE_SETTINGS_REQUEST,
				siteId: 2916284,
			} );
		} );

		test( 'should dispatch receive action when request completes', () => {
			return requestSiteSettings( 2916284 )( spy, getState ).then( () => {
				expect( spy ).toHaveBeenCalledWith(
					expect.objectContaining(
						receiveSiteSettings( 2916284, {
							blogname: 'blog name',
							blogdescription: 'blog description',
							settingKey: 'cat',
						} )
					)
				);
			} );
		} );

		test( 'should dispatch request success action when request completes', () => {
			return requestSiteSettings( 2916284 )( spy, getState ).then( () => {
				expect( spy ).toHaveBeenCalledWith(
					expect.objectContaining( {
						type: SITE_SETTINGS_REQUEST_SUCCESS,
						siteId: 2916284,
					} )
				);
			} );
		} );

		test( 'should dispatch fail action when request fails', () => {
			return requestSiteSettings( 2916285 )( spy, getState ).then( () => {
				expect( spy ).toHaveBeenCalledWith( {
					type: SITE_SETTINGS_REQUEST_FAILURE,
					siteId: 2916285,
					error: expect.objectContaining( { message: 'User cannot access this private blog.' } ),
				} );
			} );
		} );
	} );

	describe( 'saveSiteSettings()', () => {
		let savedSettings = null;

		useNock( ( mockNock ) => {
			mockNock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.4/sites/2916284/settings', ( body ) => {
					savedSettings = body;
					return true;
				} )
				.reply( 200, {
					updated: { real_update: 'ribs' },
				} )
				.post( '/rest/v1.4/sites/2916285/settings' )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.',
				} );
		} );

		beforeEach( () => {
			savedSettings = null;
		} );

		test( 'should dispatch fetch action when thunk triggered', () => {
			saveSiteSettings( 2916284, { settingKey: 'chicken' } )( spy, getState );

			expect( spy ).toHaveBeenCalledWith( {
				type: SITE_SETTINGS_SAVE,
				siteId: 2916284,
			} );
		} );

		test( 'should dispatch update action when request completes', () => {
			return saveSiteSettings( 2916284 )( spy, getState ).then( () => {
				expect( spy ).toHaveBeenCalledWith(
					updateSiteSettings( 2916284, {
						real_update: 'ribs',
					} )
				);
			} );
		} );

		test( 'should dispatch save success action when request completes', () => {
			return saveSiteSettings( 2916284 )( spy, getState ).then( () => {
				expect( spy ).toHaveBeenCalledWith( {
					type: SITE_SETTINGS_SAVE_SUCCESS,
					siteId: 2916284,
				} );
			} );
		} );

		test( 'should dispatch fail action when request fails', () => {
			return saveSiteSettings( 2916285 )( spy, getState ).then( () => {
				expect( spy ).toHaveBeenCalledWith( {
					type: SITE_SETTINGS_SAVE_FAILURE,
					siteId: 2916285,
					error: expect.objectContaining( { message: 'User cannot access this private blog.' } ),
				} );
			} );
		} );

		test( 'should format subscription options for Jetpack sites', () => {
			const settings = {
				subscription_options: {
					invitation: 'test-invitation',
					comment_follow: 'test-comment-follow',
					welcome: 'test-welcome',
					other: 'test-other',
				},
			};
			return saveSiteSettings( 2916284, settings )( spy, getState ).then( () => {
				const formattedOptions = savedSettings.subscription_options;
				expect( Array.isArray( formattedOptions ) ).toBe( true );
				expect( formattedOptions ).toEqual(
					expect.arrayContaining( [ 'test-invitation', 'test-comment-follow', 'test-welcome' ] )
				);
				expect( formattedOptions.length ).toBe( 3 );
				expect( formattedOptions ).not.toContain( 'test-other' );
			} );
		} );

		test( 'should not format subscription options for non-Jetpack sites', () => {
			const nonJetpackState = () => ( {
				sites: {
					items: {
						2916284: {
							options: {},
							jetpack: false,
						},
					},
				},
				siteSettings: { items: { 2916284: {} } },
			} );

			const settings = {
				subscription_options: {
					invitation: 'test-invitation',
					comment_follow: 'test-comment-follow',
					welcome: 'test-welcome',
				},
			};
			return saveSiteSettings( 2916284, settings )( spy, nonJetpackState ).then( () => {
				expect( savedSettings.subscription_options ).toEqual( settings.subscription_options );
			} );
		} );
	} );
} );
