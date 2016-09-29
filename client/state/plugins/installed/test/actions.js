/**
 * External dependencies
 */
import nock from 'nock';
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
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
	PLUGIN_REMOVE_REQUEST_FAILURE
} from 'state/action-types';
import {
	INSTALL_PLUGIN,
	REMOVE_PLUGIN,
	UPDATE_PLUGIN,
	ACTIVATE_PLUGIN,
	DEACTIVATE_PLUGIN,
	ENABLE_AUTOUPDATE_PLUGIN,
	DISABLE_AUTOUPDATE_PLUGIN
} from '../constants';
import {
	fetchPlugins,
	activatePlugin,
	deactivatePlugin,
	updatePlugin,
	enableAutoupdatePlugin,
	disableAutoupdatePlugin,
	installPlugin,
	removePlugin
} from '../actions';
import { akismet, helloDolly, jetpack, jetpackUpdated } from './fixtures/plugins';

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	after( () => {
		nock.cleanAll();
	} );

	describe( '#fetch()', () => {
		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/sites/2916284/plugins' )
				.reply( 200, {
					plugins: [ akismet, helloDolly, jetpack ]
				} )
				.get( '/rest/v1.1/sites/77203074/plugins' )
				.reply( 403, {
					error: 'unauthorized',
					message: 'This endpoint is only available for Jetpack powered Sites'
				} );
		} );

		it( 'should dispatch fetch action when triggered', () => {
			fetchPlugins( [ { ID: 2916284, jetpack: true } ] )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: PLUGINS_REQUEST,
				siteId: 2916284
			} );
		} );

		it( 'should dispatch plugins receive action when request completes', () => {
			const responses = fetchPlugins( [ { ID: 2916284, jetpack: true } ] )( spy );
			return Promise.all( responses ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PLUGINS_RECEIVE,
					siteId: 2916284
				} );
			} );
		} );

		it( 'should dispatch plugin request success action when request completes', () => {
			const responses = fetchPlugins( [ { ID: 2916284, jetpack: true } ] )( spy );
			return Promise.all( responses ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PLUGINS_REQUEST_SUCCESS,
					siteId: 2916284,
					data: [ akismet, helloDolly, jetpack ]
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			const responses = fetchPlugins( [ { ID: 77203074, jetpack: true } ] )( spy );
			return Promise.all( responses ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PLUGINS_REQUEST_FAILURE,
					siteId: 77203074,
					error: sinon.match( { message: 'This endpoint is only available for Jetpack powered Sites' } )
				} );
			} );
		} );
	} );

	describe( '#activate()', () => {
		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/2916284/plugins/akismet%2Fakismet', { active: true } )
				.reply( 200, Object.assign( {}, akismet, { active: true, log: [ 'Plugin activated.' ] } ) )
				.post( '/rest/v1.1/sites/2916284/plugins/fake%2Ffake' )
				.reply( 400, {
					error: 'activation_error',
					message: 'Plugin file does not exist.'
				} );
		} );

		it( 'should dispatch request action when triggered', () => {
			activatePlugin( { ID: 2916284, jetpack: true }, { slug: 'akismet', id: 'akismet/akismet' } )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: PLUGIN_ACTIVATE_REQUEST,
				action: ACTIVATE_PLUGIN,
				siteId: 2916284,
				pluginId: 'akismet/akismet'
			} );
		} );

		it( 'should dispatch plugin activate request success action when request completes', () => {
			const response = activatePlugin( { ID: 2916284, jetpack: true }, { slug: 'akismet', id: 'akismet/akismet' } )( spy );
			return response.then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PLUGIN_ACTIVATE_REQUEST_SUCCESS,
					action: ACTIVATE_PLUGIN,
					siteId: 2916284,
					pluginId: 'akismet/akismet',
					data: Object.assign( {}, akismet, { active: true, log: [ 'Plugin activated.' ] } )
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			const response = activatePlugin( { ID: 2916284, jetpack: true }, { slug: 'fake', id: 'fake/fake' } )( spy );
			return response.then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PLUGIN_ACTIVATE_REQUEST_FAILURE,
					action: ACTIVATE_PLUGIN,
					siteId: 2916284,
					pluginId: 'fake/fake',
					error: sinon.match( { message: 'Plugin file does not exist.' } )
				} );
			} );
		} );
	} );

	describe( '#deactivate()', () => {
		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/2916284/plugins/akismet%2Fakismet', { active: false } )
				.reply( 200, Object.assign( {}, akismet, { active: false, log: [ 'Plugin deactivated.' ] } ) )
				.post( '/rest/v1.1/sites/2916284/plugins/fake%2Ffake' )
				.reply( 400, {
					error: 'deactivation_error',
					message: 'Plugin file does not exist.'
				} );
		} );

		it( 'should dispatch request action when triggered', () => {
			deactivatePlugin( { ID: 2916284, jetpack: true }, { slug: 'akismet', id: 'akismet/akismet' } )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: PLUGIN_DEACTIVATE_REQUEST,
				action: DEACTIVATE_PLUGIN,
				siteId: 2916284,
				pluginId: 'akismet/akismet'
			} );
		} );

		it( 'should dispatch plugin deactivate request success action when request completes', () => {
			const response = deactivatePlugin( { ID: 2916284, jetpack: true }, { slug: 'akismet', id: 'akismet/akismet' } )( spy );
			return response.then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PLUGIN_DEACTIVATE_REQUEST_SUCCESS,
					action: DEACTIVATE_PLUGIN,
					siteId: 2916284,
					pluginId: 'akismet/akismet',
					data: Object.assign( {}, akismet, { active: false, log: [ 'Plugin deactivated.' ] } )
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			const response = deactivatePlugin( { ID: 2916284, jetpack: true }, { slug: 'fake', id: 'fake/fake' } )( spy );
			return response.then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PLUGIN_DEACTIVATE_REQUEST_FAILURE,
					action: DEACTIVATE_PLUGIN,
					siteId: 2916284,
					pluginId: 'fake/fake',
					error: sinon.match( { message: 'Plugin file does not exist.' } )
				} );
			} );
		} );
	} );

	describe( '#update()', () => {
		const site = {
			ID: 2916284,
			jetpack: true,
			canUpdateFiles: true
		};

		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/2916284/plugins/jetpack%2Fjetpack/update' )
				.reply( 200, jetpackUpdated )
				.post( '/rest/v1.1/sites/2916284/plugins/akismet%2Fakismet/update' )
				.reply( 200, Object.assign( {}, akismet, { log: [ 'No update needed' ] } ) )
				.post( '/rest/v1.1/sites/2916284/plugins/fake%2Ffake/update' )
				.reply( 400, {
					error: 'unknown_plugin',
					message: 'Plugin file does not exist.'
				} );
		} );

		it( 'should dispatch request action when triggered', () => {
			updatePlugin( site, { slug: 'jetpack', id: 'jetpack/jetpack', update: {} } )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: PLUGIN_UPDATE_REQUEST,
				action: UPDATE_PLUGIN,
				siteId: 2916284,
				pluginId: 'jetpack/jetpack'
			} );
		} );

		it( 'should dispatch plugin update request success action when request completes', () => {
			const response = updatePlugin( site, { slug: 'jetpack', id: 'jetpack/jetpack', update: {} } )( spy );
			return response.then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PLUGIN_UPDATE_REQUEST_SUCCESS,
					action: UPDATE_PLUGIN,
					siteId: 2916284,
					pluginId: 'jetpack/jetpack',
					data: jetpackUpdated,
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			const response = updatePlugin( site, { slug: 'fake', id: 'fake/fake', update: {} } )( spy );
			return response.then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PLUGIN_UPDATE_REQUEST_FAILURE,
					action: UPDATE_PLUGIN,
					siteId: 2916284,
					pluginId: 'fake/fake',
					error: sinon.match( { message: 'Plugin file does not exist.' } )
				} );
			} );
		} );

		it( 'should not dispatch actions when plugin already up-to-date', () => {
			const response = updatePlugin( site, { slug: 'jetpack', id: 'jetpack/jetpack' } )( spy );
			// updatePlugin returns a rejected promise here
			return response.catch( () => {
				expect( spy.callCount ).to.eql( 0 );
			} );
		} );
	} );

	describe( '#enableAutoupdate()', () => {
		const site = {
			ID: 2916284,
			jetpack: true,
			canUpdateFiles: true,
			canAutoupdateFiles: true,
			capabilities: {
				manage_options: true
			}
		};

		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/2916284/plugins/akismet%2Fakismet', { autoupdate: true } )
				.reply( 200, Object.assign( {}, akismet, { autoupdate: true } ) )
				.post( '/rest/v1.1/sites/2916284/plugins/fake%2Ffake', { autoupdate: true } )
				.reply( 400, {
					error: 'unknown_plugin',
					message: 'Plugin file does not exist.'
				} );
		} );

		it( 'should dispatch request action when triggered', () => {
			enableAutoupdatePlugin( site, { slug: 'akismet', id: 'akismet/akismet' } )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: PLUGIN_AUTOUPDATE_ENABLE_REQUEST,
				action: ENABLE_AUTOUPDATE_PLUGIN,
				siteId: 2916284,
				pluginId: 'akismet/akismet'
			} );
		} );

		it( 'should dispatch plugin enable autoupdate request success action when request completes', () => {
			const response = enableAutoupdatePlugin( site, { slug: 'akismet', id: 'akismet/akismet' } )( spy );
			return response.then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PLUGIN_AUTOUPDATE_ENABLE_REQUEST_SUCCESS,
					action: ENABLE_AUTOUPDATE_PLUGIN,
					siteId: 2916284,
					pluginId: 'akismet/akismet',
					data: Object.assign( {}, akismet, { autoupdate: true } ),
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			const response = enableAutoupdatePlugin( site, { slug: 'fake', id: 'fake/fake' } )( spy );
			return response.then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PLUGIN_AUTOUPDATE_ENABLE_REQUEST_FAILURE,
					action: ENABLE_AUTOUPDATE_PLUGIN,
					siteId: 2916284,
					pluginId: 'fake/fake',
					error: sinon.match( { message: 'Plugin file does not exist.' } )
				} );
			} );
		} );
	} );

	describe( '#disableAutoupdate()', () => {
		const site = {
			ID: 2916284,
			jetpack: true,
			canUpdateFiles: true,
			canAutoupdateFiles: true,
			capabilities: {
				manage_options: true
			}
		};

		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/2916284/plugins/akismet%2Fakismet', { autoupdate: false } )
				.reply( 200, Object.assign( {}, akismet, { autoupdate: false } ) )
				.post( '/rest/v1.1/sites/2916284/plugins/fake%2Ffake', { autoupdate: false } )
				.reply( 400, {
					error: 'unknown_plugin',
					message: 'Plugin file does not exist.'
				} );
		} );

		it( 'should dispatch request action when triggered', () => {
			disableAutoupdatePlugin( site, { slug: 'akismet', id: 'akismet/akismet' } )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: PLUGIN_AUTOUPDATE_DISABLE_REQUEST,
				action: DISABLE_AUTOUPDATE_PLUGIN,
				siteId: 2916284,
				pluginId: 'akismet/akismet'
			} );
		} );

		it( 'should dispatch plugin disable autoupdate request success action when request completes', () => {
			const response = disableAutoupdatePlugin( site, { slug: 'akismet', id: 'akismet/akismet' } )( spy );
			return response.then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PLUGIN_AUTOUPDATE_DISABLE_REQUEST_SUCCESS,
					action: DISABLE_AUTOUPDATE_PLUGIN,
					siteId: 2916284,
					pluginId: 'akismet/akismet',
					data: Object.assign( {}, akismet, { autoupdate: false } )
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			const response = disableAutoupdatePlugin( site, { slug: 'fake', id: 'fake/fake' } )( spy );
			return response.then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PLUGIN_AUTOUPDATE_DISABLE_REQUEST_FAILURE,
					action: DISABLE_AUTOUPDATE_PLUGIN,
					siteId: 2916284,
					pluginId: 'fake/fake',
					error: sinon.match( { message: 'Plugin file does not exist.' } )
				} );
			} );
		} );
	} );

	describe( '#install()', () => {
		const site = {
			ID: 2916284,
			jetpack: true,
			canUpdateFiles: true,
			isMainNetworkSite: () => true,
			capabilities: {
				manage_options: true
			}
		};

		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/2916284/plugins/jetpack%2Fjetpack/install' )
				.reply( 200, jetpackUpdated )
				.post( '/rest/v1.1/sites/2916284/plugins/fake%2Ffake/install' )
				.reply( 400, {
					error: 'unknown_plugin',
					message: 'Plugin file does not exist.'
				} );
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/2916284/plugins/jetpack%2Fjetpack', { autoupdate: true } )
				.reply( 200, Object.assign( {}, jetpackUpdated, { autoupdate: true } ) );
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/2916284/plugins/jetpack%2Fjetpack', { active: true } )
				.reply( 200, Object.assign( {}, jetpackUpdated, { active: true, log: [ 'Plugin activated.' ] } ) );
		} );

		it( 'should dispatch request action when triggered', () => {
			installPlugin( site, { slug: 'jetpack', id: 'jetpack/jetpack' } )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: PLUGIN_INSTALL_REQUEST,
				action: INSTALL_PLUGIN,
				siteId: 2916284,
				pluginId: 'jetpack/jetpack'
			} );
		} );

		it( 'should dispatch plugin install request success action when request completes', () => {
			const response = installPlugin( site, { slug: 'jetpack', id: 'jetpack/jetpack' } )( spy );
			return response.then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PLUGIN_INSTALL_REQUEST_SUCCESS,
					action: INSTALL_PLUGIN,
					siteId: 2916284,
					pluginId: 'jetpack/jetpack',
					data: jetpackUpdated
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			const response = installPlugin( site, { slug: 'fake', id: 'fake/fake' } )( spy );
			return response.catch( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PLUGIN_INSTALL_REQUEST_FAILURE,
					action: INSTALL_PLUGIN,
					siteId: 2916284,
					pluginId: 'fake/fake',
					error: sinon.match( { message: 'Plugin file does not exist.' } )
				} );
			} );
		} );
	} );

	describe( '#remove()', () => {
		const site = {
			ID: 2916284,
			jetpack: true,
			canUpdateFiles: true,
			isMainNetworkSite: () => true,
			capabilities: {
				manage_options: true
			}
		};

		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/2916284/plugins/akismet%2Fakismet/delete' )
				.reply( 200, Object.assign( {}, akismet, { log: [ 'Plugin deleted' ] } ) )
				.post( '/rest/v1.1/sites/2916284/plugins/fake%2Ffake/delete' )
				.reply( 400, {
					error: 'unknown_plugin',
					message: 'Plugin file does not exist.'
				} );
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/2916284/plugins/akismet%2Fakismet', { autoupdate: false } )
				.reply( 200, Object.assign( {}, akismet, { autoupdate: false } ) );
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/2916284/plugins/akismet%2Fakismet', { active: false } )
				.reply( 200, Object.assign( {}, akismet, { active: false, log: [ 'Plugin deactivated.' ] } ) );
		} );

		it( 'should dispatch request action when triggered', () => {
			removePlugin( site, { slug: 'akismet', id: 'akismet/akismet' } )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: PLUGIN_REMOVE_REQUEST,
				action: REMOVE_PLUGIN,
				siteId: 2916284,
				pluginId: 'akismet/akismet'
			} );
		} );

		it( 'should dispatch plugin remove request success action when request completes', () => {
			const response = removePlugin( site, { slug: 'akismet', id: 'akismet/akismet' } )( spy );
			return response.then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PLUGIN_REMOVE_REQUEST_SUCCESS,
					action: REMOVE_PLUGIN,
					siteId: 2916284,
					pluginId: 'akismet/akismet'
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			const response = removePlugin( site, { slug: 'fake', id: 'fake/fake' } )( spy );
			return response.catch( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PLUGIN_REMOVE_REQUEST_FAILURE,
					action: REMOVE_PLUGIN,
					siteId: 2916284,
					pluginId: 'fake/fake',
					error: sinon.match( { message: 'Plugin file does not exist.' } )
				} );
			} );
		} );
	} );
} );
