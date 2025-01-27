import nock from 'nock';
import {
	INSTALL_PLUGIN,
	REMOVE_PLUGIN,
	UPDATE_PLUGIN,
	ACTIVATE_PLUGIN,
	DEACTIVATE_PLUGIN,
	ENABLE_AUTOUPDATE_PLUGIN,
	DISABLE_AUTOUPDATE_PLUGIN,
} from 'calypso/lib/plugins/constants';
import {
	PLUGINS_ALL_RECEIVE,
	PLUGINS_ALL_REQUEST,
	PLUGINS_ALL_REQUEST_SUCCESS,
	PLUGINS_ALL_REQUEST_FAILURE,
	PLUGINS_RECEIVE,
	PLUGINS_REQUEST,
	PLUGINS_REQUEST_SUCCESS,
	PLUGINS_REQUEST_FAILURE,
	PLUGIN_ACTIVATE_REQUEST,
	PLUGIN_ACTIVATE_REQUEST_SUCCESS,
	PLUGIN_ACTIVATE_REQUEST_FAILURE,
	PLUGIN_DEACTIVATE_REQUEST,
	PLUGIN_DEACTIVATE_REQUEST_SUCCESS,
	PLUGIN_DEACTIVATE_REQUEST_FAILURE,
	PLUGIN_UPDATE_REQUEST,
	PLUGIN_UPDATE_REQUEST_SUCCESS,
	PLUGIN_UPDATE_REQUEST_FAILURE,
	PLUGIN_AUTOUPDATE_ENABLE_REQUEST,
	PLUGIN_AUTOUPDATE_ENABLE_REQUEST_SUCCESS,
	PLUGIN_AUTOUPDATE_ENABLE_REQUEST_FAILURE,
	PLUGIN_AUTOUPDATE_DISABLE_REQUEST,
	PLUGIN_AUTOUPDATE_DISABLE_REQUEST_SUCCESS,
	PLUGIN_AUTOUPDATE_DISABLE_REQUEST_FAILURE,
	PLUGIN_INSTALL_REQUEST,
	PLUGIN_INSTALL_REQUEST_SUCCESS,
	PLUGIN_INSTALL_REQUEST_FAILURE,
	PLUGIN_REMOVE_REQUEST,
	PLUGIN_REMOVE_REQUEST_SUCCESS,
	PLUGIN_REMOVE_REQUEST_FAILURE,
	SITE_PLUGIN_UPDATED,
	PLUGIN_ACTION_STATUS_UPDATE,
} from 'calypso/state/action-types';
import {
	fetchSitePlugins,
	fetchAllPlugins,
	activatePlugin,
	deactivatePlugin,
	updatePlugin,
	enableAutoupdatePlugin,
	disableAutoupdatePlugin,
	installPlugin,
	removePlugin,
	handleDispatchSuccessCallback,
} from '../actions';
import {
	akismet,
	akismetWithSites,
	helloDolly,
	jetpack,
	jetpackWithSites,
	jetpackUpdated,
} from './fixtures/plugins';

describe( 'actions', () => {
	const spy = jest.fn();

	const getState = () => ( {
		currentUser: {
			capabilities: {
				2916284: {
					manage_options: true,
				},
			},
		},
		sites: {
			items: {
				2916284: {
					ID: 2916284,
				},
			},
		},
	} );

	afterEach( () => {
		spy.mockClear();
	} );

	describe( '#fetchAllPlugins()', () => {
		describe( 'success', () => {
			beforeAll( () => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/me/sites/plugins' )
					.reply( 200, {
						sites: {
							2916284: [ akismet, helloDolly, jetpack ],
						},
					} )
					.post( '/rest/v1.1/sites/2916284/plugins/jetpack%2Fjetpack/update' )
					.reply( 200, jetpackUpdated );
			} );

			afterAll( () => {
				nock.cleanAll();
			} );

			test( 'should dispatch fetch all action when triggered', () => {
				fetchAllPlugins()( spy, getState );
				expect( spy ).toHaveBeenCalledWith( {
					type: PLUGINS_ALL_REQUEST,
				} );
			} );

			test( 'should dispatch plugins request success action when request completes', async () => {
				await fetchAllPlugins()( spy, getState );
				expect( spy ).toHaveBeenCalledWith( {
					type: PLUGINS_ALL_REQUEST_SUCCESS,
				} );
			} );

			test( 'should dispatch plugins receive action when request completes', async () => {
				await fetchAllPlugins()( spy, getState );
				expect( spy ).toHaveBeenCalledWith( {
					type: PLUGINS_ALL_RECEIVE,
					allSitesPlugins: {
						2916284: [ akismet, helloDolly, jetpack ],
					},
				} );
			} );
		} );

		describe( 'failure', () => {
			const message =
				'An active access token must be used to query information about the current user.';

			beforeAll( () => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/me/sites/plugins' )
					.reply( 403, {
						error: 'authorization_required',
						message,
					} );
			} );

			afterAll( () => {
				nock.cleanAll();
			} );

			test( 'should dispatch fail action when request fails', async () => {
				await fetchAllPlugins()( spy, getState );
				expect( spy ).toHaveBeenCalledWith( {
					type: PLUGINS_ALL_REQUEST_FAILURE,
					error: expect.objectContaining( {
						message,
					} ),
				} );
			} );
		} );
	} );

	describe( '#fetchSitePlugins()', () => {
		beforeAll( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/sites/2916284/plugins' )
				.reply( 200, {
					plugins: [ akismet, helloDolly, jetpack ],
				} )
				.get( '/rest/v1.1/sites/77203074/plugins' )
				.reply( 403, {
					error: 'unauthorized',
					message: 'This endpoint is only available for Jetpack powered Sites',
				} )
				.post( '/rest/v1.1/sites/2916284/plugins/jetpack%2Fjetpack/update' )
				.reply( 200, jetpackUpdated );
		} );

		afterAll( () => {
			nock.cleanAll();
		} );

		test( 'should dispatch fetch action when triggered', () => {
			fetchSitePlugins( 2916284 )( spy, getState );

			expect( spy ).toHaveBeenCalledWith( {
				type: PLUGINS_REQUEST,
				siteId: 2916284,
			} );
		} );

		test( 'should dispatch plugins receive action when request completes', async () => {
			await fetchSitePlugins( 2916284 )( spy, getState );
			expect( spy ).toHaveBeenCalledWith( {
				type: PLUGINS_RECEIVE,
				siteId: 2916284,
				data: [ akismet, helloDolly, jetpack ],
			} );
		} );

		test( 'should dispatch plugin request success action when request completes', async () => {
			await fetchSitePlugins( 2916284 )( spy, getState );
			expect( spy ).toHaveBeenCalledWith( {
				type: PLUGINS_REQUEST_SUCCESS,
				siteId: 2916284,
			} );
		} );

		test( 'should dispatch fail action when request fails', async () => {
			await fetchSitePlugins( 77203074 )( spy, getState );
			expect( spy ).toHaveBeenCalledWith( {
				type: PLUGINS_REQUEST_FAILURE,
				siteId: 77203074,
				error: expect.objectContaining( {
					message: 'This endpoint is only available for Jetpack powered Sites',
				} ),
			} );
		} );
	} );

	describe( '#activatePlugin()', () => {
		beforeAll( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/2916284/plugins/akismet%2Fakismet', { active: true } )
				.reply( 200, { ...akismet, active: true, log: [ 'Plugin activated.' ] } )
				.post( '/rest/v1.1/sites/2916284/plugins/fake%2Ffake' )
				.reply( 400, {
					error: 'activation_error',
					message: 'Plugin file does not exist.',
				} );
		} );

		afterAll( () => {
			nock.cleanAll();
		} );

		test( 'should dispatch request action when triggered', () => {
			activatePlugin( 2916284, {
				...akismetWithSites,
				sites: { [ 2916284 ]: { active: false } },
			} )( spy, getState );

			expect( spy ).toHaveBeenCalledWith( {
				type: PLUGIN_ACTIVATE_REQUEST,
				action: ACTIVATE_PLUGIN,
				siteId: 2916284,
				pluginId: 'akismet/akismet',
			} );
		} );

		test( 'should dispatch plugin activate request success action when request completes', async () => {
			await activatePlugin( 2916284, {
				...akismetWithSites,
				sites: { [ 2916284 ]: { active: false } },
			} )( spy, getState );
			expect( spy ).toHaveBeenCalledWith( {
				type: PLUGIN_ACTIVATE_REQUEST_SUCCESS,
				action: ACTIVATE_PLUGIN,
				siteId: 2916284,
				pluginId: 'akismet/akismet',
				data: {
					...akismet,
					active: true,
					log: [ 'Plugin activated.' ],
				},
			} );
		} );

		test( 'should dispatch fail action when request fails', async () => {
			await activatePlugin( 2916284, {
				slug: 'fake',
				id: 'fake/fake',
				sites: { [ 2916284 ]: { active: false } },
			} )( spy, getState );
			expect( spy ).toHaveBeenCalledWith( {
				type: PLUGIN_ACTIVATE_REQUEST_FAILURE,
				action: ACTIVATE_PLUGIN,
				siteId: 2916284,
				pluginId: 'fake/fake',
				error: expect.objectContaining( { message: 'Plugin file does not exist.' } ),
			} );
		} );
	} );

	describe( '#deactivatePlugin()', () => {
		beforeAll( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/2916284/plugins/akismet%2Fakismet', { active: false } )
				.reply( 200, { ...akismet, active: false, log: [ 'Plugin deactivated.' ] } )
				.post( '/rest/v1.1/sites/2916284/plugins/fake%2Ffake' )
				.reply( 400, {
					error: 'deactivation_error',
					message: 'Plugin file does not exist.',
				} );
		} );

		afterAll( () => {
			nock.cleanAll();
		} );

		test( 'should dispatch request action when triggered', () => {
			deactivatePlugin( 2916284, akismetWithSites )( spy, getState );

			expect( spy ).toHaveBeenCalledWith( {
				type: PLUGIN_DEACTIVATE_REQUEST,
				action: DEACTIVATE_PLUGIN,
				siteId: 2916284,
				pluginId: 'akismet/akismet',
			} );
		} );

		test( 'should dispatch plugin deactivate request success action when request completes', async () => {
			await deactivatePlugin( 2916284, akismetWithSites )( spy, getState );
			expect( spy ).toHaveBeenCalledWith( {
				type: PLUGIN_DEACTIVATE_REQUEST_SUCCESS,
				action: DEACTIVATE_PLUGIN,
				siteId: 2916284,
				pluginId: 'akismet/akismet',
				data: { ...akismet, active: false, log: [ 'Plugin deactivated.' ] },
			} );
		} );

		test( 'should dispatch fail action when request fails', async () => {
			await deactivatePlugin( 2916284, { slug: 'fake', id: 'fake/fake', active: true } )(
				spy,
				getState
			);
			expect( spy ).toHaveBeenCalledWith( {
				type: PLUGIN_DEACTIVATE_REQUEST_FAILURE,
				action: DEACTIVATE_PLUGIN,
				siteId: 2916284,
				pluginId: 'fake/fake',
				error: expect.objectContaining( { message: 'Plugin file does not exist.' } ),
			} );
		} );
	} );

	describe( '#updatePlugin()', () => {
		const site = {
			ID: 2916284,
			jetpack: true,
			canUpdateFiles: true,
		};

		beforeAll( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/2916284/plugins/jetpack%2Fjetpack/update' )
				.reply( 200, jetpackUpdated )
				.post( '/rest/v1.1/sites/2916284/plugins/akismet%2Fakismet/update' )
				.reply( 200, { ...akismet, log: [ 'No update needed' ] } )
				.post( '/rest/v1.1/sites/2916284/plugins/fake%2Ffake/update' )
				.reply( 400, {
					error: 'unknown_plugin',
					message: 'Plugin file does not exist.',
				} );
		} );

		afterAll( () => {
			nock.cleanAll();
		} );

		test( 'should dispatch request action when triggered', () => {
			updatePlugin( site.ID, jetpackWithSites )( spy, getState );

			expect( spy ).toHaveBeenCalledWith( {
				type: PLUGIN_UPDATE_REQUEST,
				action: UPDATE_PLUGIN,
				siteId: 2916284,
				pluginId: 'jetpack/jetpack',
			} );
		} );

		test( 'should dispatch plugin update request success action when request completes', () => {
			const response = updatePlugin( site.ID, jetpackWithSites )( spy, getState );
			return response.then( () => {
				expect( spy ).toHaveBeenCalledWith( {
					type: PLUGIN_UPDATE_REQUEST_SUCCESS,
					action: UPDATE_PLUGIN,
					siteId: 2916284,
					pluginId: 'jetpack/jetpack',
					data: jetpackUpdated,
				} );
			} );
		} );

		test( 'should dispatch site update action when request completes', () => {
			const response = updatePlugin( site.ID, jetpackWithSites )( spy, getState );
			return response.then( () => {
				expect( spy ).toHaveBeenCalledWith( {
					type: SITE_PLUGIN_UPDATED,
					siteId: 2916284,
				} );
			} );
		} );

		test( 'should dispatch fail action when request fails', () => {
			const response = updatePlugin( site.ID, { slug: 'fake', id: 'fake/fake', update: {} } )(
				spy,
				getState
			);
			return response.then( () => {
				expect( spy ).toHaveBeenCalledWith( {
					type: PLUGIN_UPDATE_REQUEST_FAILURE,
					action: UPDATE_PLUGIN,
					siteId: 2916284,
					pluginId: 'fake/fake',
					error: expect.objectContaining( { message: 'Plugin file does not exist.' } ),
				} );
			} );
		} );

		test( 'should dispatch site update actions when plugin already up-to-date', async () => {
			await updatePlugin( site.ID, jetpackWithSites )( spy, getState );

			expect( spy ).toHaveBeenCalledWith( {
				type: PLUGIN_UPDATE_REQUEST_SUCCESS,
				action: UPDATE_PLUGIN,
				siteId: 2916284,
				pluginId: 'jetpack/jetpack',
				data: jetpackUpdated,
			} );
		} );
	} );

	describe( '#enableAutoupdatePlugin()', () => {
		const site = {
			ID: 2916284,
			jetpack: true,
			canUpdateFiles: true,
			canAutoupdateFiles: true,
			capabilities: {
				manage_options: true,
			},
		};

		beforeAll( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/2916284/plugins/akismet%2Fakismet', { autoupdate: true } )
				.reply( 200, { ...akismet, autoupdate: true } )
				.post( '/rest/v1.1/sites/2916284/plugins/fake%2Ffake', { autoupdate: true } )
				.reply( 400, {
					error: 'unknown_plugin',
					message: 'Plugin file does not exist.',
				} )
				.post( '/rest/v1.1/sites/2916284/plugins/jetpack%2Fjetpack', { autoupdate: true } )
				.reply( 200, { ...jetpack, autoupdate: true } )
				.post( '/rest/v1.1/sites/2916284/plugins/jetpack%2Fjetpack/update' )
				.reply( 200, jetpackUpdated );
		} );

		afterAll( () => {
			nock.cleanAll();
		} );

		test( 'should dispatch request action when triggered', () => {
			enableAutoupdatePlugin( site.ID, {
				...akismetWithSites,
				sites: { [ 2916284 ]: { autoupdate: false } },
			} )( spy, getState );

			expect( spy ).toHaveBeenCalledWith( {
				type: PLUGIN_AUTOUPDATE_ENABLE_REQUEST,
				action: ENABLE_AUTOUPDATE_PLUGIN,
				siteId: 2916284,
				pluginId: 'akismet/akismet',
			} );
		} );

		test( 'should dispatch plugin enable autoupdate request success action when request completes', async () => {
			await enableAutoupdatePlugin( site.ID, {
				...akismetWithSites,
				sites: { [ 2916284 ]: { autoupdate: false } },
			} )( spy, getState );

			expect( spy ).toHaveBeenCalledWith( {
				type: PLUGIN_AUTOUPDATE_ENABLE_REQUEST_SUCCESS,
				action: ENABLE_AUTOUPDATE_PLUGIN,
				siteId: 2916284,
				pluginId: 'akismet/akismet',
				data: { ...akismet, autoupdate: true },
			} );
		} );

		test( 'should dispatch fail action when request fails', async () => {
			await enableAutoupdatePlugin( site.ID, { slug: 'fake', id: 'fake/fake' } )( spy, getState );

			expect( spy ).toHaveBeenCalledWith( {
				type: PLUGIN_AUTOUPDATE_ENABLE_REQUEST_FAILURE,
				action: ENABLE_AUTOUPDATE_PLUGIN,
				siteId: 2916284,
				pluginId: 'fake/fake',
				error: expect.objectContaining( { message: 'Plugin file does not exist.' } ),
			} );
		} );

		test( 'should dispatch plugin update request', async () => {
			await enableAutoupdatePlugin( site.ID, {
				...jetpackWithSites,
				sites: { [ 2916284 ]: { autoupdate: false } },
			} )( spy, getState );

			expect( spy ).toHaveBeenCalledWith( {
				type: PLUGIN_UPDATE_REQUEST,
				action: UPDATE_PLUGIN,
				siteId: 2916284,
				pluginId: 'jetpack/jetpack',
			} );
		} );
	} );

	describe( '#disableAutoupdatePlugin()', () => {
		const site = {
			ID: 2916284,
			jetpack: true,
			canUpdateFiles: true,
			canAutoupdateFiles: true,
			capabilities: {
				manage_options: true,
			},
		};

		beforeAll( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/2916284/plugins/akismet%2Fakismet', { autoupdate: false } )
				.reply( 200, { ...akismet, autoupdate: false } )
				.post( '/rest/v1.1/sites/2916284/plugins/fake%2Ffake', { autoupdate: false } )
				.reply( 400, {
					error: 'unknown_plugin',
					message: 'Plugin file does not exist.',
				} );
		} );

		afterAll( () => {
			nock.cleanAll();
		} );

		test( 'should dispatch request action when triggered', () => {
			disableAutoupdatePlugin( site.ID, akismetWithSites )( spy, getState );

			expect( spy ).toHaveBeenCalledWith( {
				type: PLUGIN_AUTOUPDATE_DISABLE_REQUEST,
				action: DISABLE_AUTOUPDATE_PLUGIN,
				siteId: 2916284,
				pluginId: 'akismet/akismet',
			} );
		} );

		test( 'should dispatch plugin disable autoupdate request success action when request completes', async () => {
			await disableAutoupdatePlugin( site.ID, akismetWithSites )( spy, getState );

			expect( spy ).toHaveBeenCalledWith( {
				type: PLUGIN_AUTOUPDATE_DISABLE_REQUEST_SUCCESS,
				action: DISABLE_AUTOUPDATE_PLUGIN,
				siteId: 2916284,
				pluginId: 'akismet/akismet',
				data: { ...akismet, autoupdate: false },
			} );
		} );

		test( 'should dispatch fail action when request fails', async () => {
			await disableAutoupdatePlugin( site.ID, { slug: 'fake', id: 'fake/fake', autoupdate: true } )(
				spy,
				getState
			);

			expect( spy ).toHaveBeenCalledWith( {
				type: PLUGIN_AUTOUPDATE_DISABLE_REQUEST_FAILURE,
				action: DISABLE_AUTOUPDATE_PLUGIN,
				siteId: 2916284,
				pluginId: 'fake/fake',
				error: expect.objectContaining( { message: 'Plugin file does not exist.' } ),
			} );
		} );
	} );

	describe( '#installPlugin()', () => {
		const site = {
			ID: 2916284,
			jetpack: true,
			canUpdateFiles: true,
			isMainNetworkSite: true,
			capabilities: {
				manage_options: true,
			},
		};

		beforeAll( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/2916284/plugins/install', { slug: 'jetpack' } )
				.reply( 200, jetpackUpdated )
				.post( '/rest/v1.1/sites/2916284/plugins/install', { slug: 'fake' } )
				.reply( 400, {
					error: 'unknown_plugin',
					message: 'Plugin file does not exist.',
				} );
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/2916284/plugins/jetpack%2Fjetpack', { autoupdate: true } )
				.reply( 200, { ...jetpackUpdated, autoupdate: true } );
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/2916284/plugins/jetpack%2Fjetpack', { active: true } )
				.reply( 200, { ...jetpackUpdated, active: true, log: [ 'Plugin activated.' ] } );
		} );

		afterAll( () => {
			nock.cleanAll();
		} );

		test( 'should dispatch request action when triggered', async () => {
			await installPlugin( site.ID, { slug: 'jetpack', id: 'jetpack/jetpack' } )( spy, getState );

			expect( spy ).toHaveBeenCalledWith( {
				type: PLUGIN_INSTALL_REQUEST,
				action: INSTALL_PLUGIN,
				siteId: 2916284,
				pluginId: 'jetpack/jetpack',
			} );
		} );

		test( 'should dispatch plugin install request success action when request completes', async () => {
			await installPlugin( site.ID, { slug: 'jetpack', id: 'jetpack/jetpack' } )( spy, getState );

			expect( spy ).toHaveBeenCalledWith( {
				type: PLUGIN_INSTALL_REQUEST_SUCCESS,
				action: INSTALL_PLUGIN,
				siteId: 2916284,
				pluginId: 'jetpack/jetpack',
				data: jetpackUpdated,
			} );
		} );

		test( 'should dispatch fail action when request fails', async () => {
			const response = installPlugin( site.ID, { slug: 'fake', id: 'fake/fake' } )( spy, getState );

			await expect( response ).rejects.toThrow( 'Plugin file does not exist.' );
			expect( spy ).toHaveBeenCalledWith( {
				type: PLUGIN_INSTALL_REQUEST_FAILURE,
				action: INSTALL_PLUGIN,
				siteId: 2916284,
				pluginId: 'fake/fake',
				data: {},
				error: expect.objectContaining( { message: 'Plugin file does not exist.' } ),
			} );
		} );
	} );

	describe( '#removePlugin()', () => {
		const site = {
			ID: 2916284,
			jetpack: true,
			canUpdateFiles: true,
			isMainNetworkSite: true,
			capabilities: {
				manage_options: true,
			},
		};

		beforeAll( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/2916284/plugins/akismet%2Fakismet/delete' )
				.reply( 200, { ...akismet, log: [ 'Plugin deleted' ] } )
				.post( '/rest/v1.1/sites/2916284/plugins/fake%2Ffake/delete' )
				.reply( 400, {
					error: 'unknown_plugin',
					message: 'Plugin file does not exist.',
				} );
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/2916284/plugins/akismet%2Fakismet', { autoupdate: false } )
				.reply( 200, { ...akismet, autoupdate: false } );
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/2916284/plugins/akismet%2Fakismet', { active: false } )
				.reply( 200, { ...akismet, active: false, log: [ 'Plugin deactivated.' ] } );
		} );

		afterAll( () => {
			nock.cleanAll();
		} );

		test( 'should dispatch request action when triggered', () => {
			removePlugin( site.ID, akismetWithSites )( spy, getState );

			expect( spy ).toHaveBeenCalledWith( {
				type: PLUGIN_REMOVE_REQUEST,
				action: REMOVE_PLUGIN,
				siteId: 2916284,
				pluginId: 'akismet/akismet',
			} );
		} );

		test( 'should dispatch plugin remove request success action when request completes', async () => {
			await removePlugin( site.ID, akismetWithSites )( spy, getState );

			expect( spy ).toHaveBeenCalledWith( {
				type: PLUGIN_REMOVE_REQUEST_SUCCESS,
				action: REMOVE_PLUGIN,
				siteId: 2916284,
				pluginId: 'akismet/akismet',
			} );
		} );

		test( 'should dispatch fail action when request fails', async () => {
			const response = removePlugin( site.ID, { slug: 'fake', id: 'fake/fake' } )( spy, getState );

			await expect( response ).rejects.toThrow( 'Plugin file does not exist.' );
			expect( spy ).toHaveBeenCalledWith( {
				type: PLUGIN_REMOVE_REQUEST_FAILURE,
				action: REMOVE_PLUGIN,
				siteId: 2916284,
				pluginId: 'fake/fake',
				error: expect.objectContaining( { message: 'Plugin file does not exist.' } ),
			} );
		} );
	} );

	describe( '#handleDispatchSuccessCallback()', () => {
		test( 'should dispatch status update and the action dispatch call when a plugin is activated successfully', () => {
			jest.useFakeTimers();
			jest.spyOn( global, 'setTimeout' );
			const defaultAction = {
				action: ACTIVATE_PLUGIN,
				siteId: 2916284,
				pluginId: 'akismet/akismet',
			};
			handleDispatchSuccessCallback( defaultAction, {} )( spy );

			expect( spy.mock.calls[ 0 ][ 0 ] ).toEqual( {
				type: PLUGIN_ACTION_STATUS_UPDATE,
				action: ACTIVATE_PLUGIN,
				siteId: 2916284,
				pluginId: 'akismet/akismet',
				data: {
					statusRecentlyChanged: true,
				},
			} );

			expect( setTimeout ).toHaveBeenCalledTimes( 1 );
			expect( setTimeout ).toHaveBeenLastCalledWith( expect.any( Function ), 3000 );
		} );
	} );
} );
