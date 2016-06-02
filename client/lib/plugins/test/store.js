/**
 * External dependencies
 */
import { assert } from 'chai' ;

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';
import useFakeDom from 'test/helpers/use-fake-dom';
import { useFakeTimers } from 'test/helpers/use-sinon';

import plugins from './fixtures/plugins';
import site from './fixtures/site';
import multiSite from './fixtures/multi-site';
import actions from './fixtures/actions';
import updatePluginData from './fixtures/updated-plugin';
import mockedSitesList from './mocks/sites-list';

/**
 * setup a react test enviroment
 */

describe( 'Plugins Store', () => {
	let Dispatcher, PluginsStore;

	useMockery( mockery => {
		mockery.registerMock( 'lib/sites-list', mockedSitesList );
	} );

	useFakeDom();

	beforeEach( () => {
		Dispatcher = require( 'dispatcher' );
		PluginsStore = require( 'lib/plugins/store' );
	} );

	it( 'Store should be an object', () => {
		assert.isObject( PluginsStore );
	} );

	it( 'Store should have method emitChange', () => {
		assert.isFunction( PluginsStore.emitChange );
	} );

	describe( 'Fetch Plugins', () => {
		beforeEach( () => {
			Dispatcher.handleServerAction( actions.fetched );
		} );

		it( 'Should update the store on RECEIVE_PLUGINS', () => {
			assert.isNotNull( PluginsStore.getSitePlugins( site ) );
		} );

		describe( 'getPlugin method', () => {
			it( 'Store should have method getPlugin', () => {
				assert.isFunction( PluginsStore.getPlugin );
			} );

			it( 'should return an object', () => {
				assert.isObject( PluginsStore.getPlugin( site, 'akismet' ) );
			} );

			it( 'should accept sites as an array of objects or object', () => {
				assert.deepEqual( PluginsStore.getPlugin( site, 'akismet' ), PluginsStore.getPlugin( [ site ], 'akismet' ) );
			} );

			it( 'should return an object with attribute sites array', () => {
				const Plugin = PluginsStore.getPlugin( site, 'akismet' );
				assert.isArray( Plugin.sites );
			} );
		} );

		describe( 'getPlugins method', () => {
			it( 'Store should have method getPlugins', () => {
				assert.isFunction( PluginsStore.getPlugins );
			} );

			it( 'should return an array of objects', () => {
				const Plugins = PluginsStore.getPlugins( site );
				assert.isArray( Plugins );
				assert.isObject( Plugins[ 0 ] );
			} );

			it( 'should return an object with attribute sites array', () => {
				const Plugins = PluginsStore.getPlugins( site );
				assert.isArray( Plugins[ 0 ].sites );
				assert.isObject( Plugins[ 0 ].sites[ 0 ] );
			} );

			it( 'should return the same object as getPlugin', () => {
				const Plugins = PluginsStore.getPlugins( site ),
					Plugin = PluginsStore.getPlugin( site, Plugins[ 0 ].slug );
				assert.deepEqual( Plugins[ 0 ], Plugin );
			} );

			it( 'should return active Plugins', () => {
				const Plugins = PluginsStore.getPlugins( site, 'active' ),
					Plugin = PluginsStore.getPlugin( site, Plugins[ 0 ].slug );
				assert.deepEqual( Plugins[ 0 ], Plugin );
				assert.isTrue( Plugins[ 0 ].active );
			} );

			it( 'should return inactive Plugins', () => {
				const Plugins = PluginsStore.getPlugins( site, 'inactive' ),
					Plugin = PluginsStore.getPlugin( site, Plugins[ 0 ].slug );
				assert.deepEqual( Plugins[ 0 ], Plugin );
				assert.isFalse( Plugins[ 0 ].active );
			} );

			it( 'should return needs update Plugins', () => {
				const Plugins = PluginsStore.getPlugins( site, 'updates' ),
					Plugin = PluginsStore.getPlugin( site, Plugins[ 0 ].slug );
				assert.deepEqual( Plugins[ 0 ], Plugin );
				assert.isObject( Plugins[ 0 ].update );
			} );

			it( 'should return all Plugin', () => {
				const Plugins = PluginsStore.getPlugins( site, 'all' );
				assert.equal( Plugins.length, plugins.length );
			} );

			it( 'should return none Plugin', () => {
				const Plugins = PluginsStore.getPlugins( site, 'none' );
				assert.equal( Plugins.length, 0 );
			} );
		} );

		describe( 'getSitePlugin method', () => {
			it( 'Store should have method getSitePlugin', () => {
				assert.isFunction( PluginsStore.getSitePlugin );
			} );

			it( 'Should have return a plugin object for a site', () => {
				const Aksimet = PluginsStore.getSitePlugin( site, 'akismet' );
				assert.isObject( Aksimet );
			} );

			it( 'Should have return undefined for a site if the plugin doesn\'t exist', () => {
				assert.isUndefined( PluginsStore.getSitePlugin( site, 'non-plugin-slug' ) );
			} );
		} );

		describe( 'getSitePlugins method', () => {
			it( 'Store should have method getSitePlugins', () => {
				assert.isFunction( PluginsStore.getSitePlugins );
			} );

			it( 'Should have return Array of Objects', () => {
				const Plugins = PluginsStore.getSitePlugins( site );
				assert.isArray( Plugins );
				assert.isObject( Plugins[ 0 ] );
			} );

			it( 'Should have return undefined if site doesn\'t exist', () => {
				assert.isUndefined( PluginsStore.getSitePlugins( {
					ID: 1,
					jetpack: false,
					plan: { product_slug: 'free_plan' }
				} ) );
			} );
		} );

		describe( 'getSites method', () => {
			it( 'Store should have method getSites', () => {
				assert.isFunction( PluginsStore.getSites );
			} );

			it( 'Should return Array of Objects', () => {
				const Sites = PluginsStore.getSites( site, 'akismet' );
				assert.isArray( Sites );
				assert.isObject( Sites[ 0 ] );
			} );

			it( 'Should return Array of Objects that has the pluginSlug as a attribute', () => {
				const Sites = PluginsStore.getSites( site, 'akismet' );
				assert.isArray( Sites );
				assert.isObject( Sites[ 0 ] );
				assert.equal( Sites[ 0 ].plugin.slug, 'akismet' );
			} );
		} );

		it( 'Should return an empty array if RECEIVE_PLUGINS errors', () => {
			let UpdatedStore;
			Dispatcher.handleServerAction( actions.fetchedError );
			UpdatedStore = PluginsStore.getPlugins( {
				ID: 123,
				jetpack: false,
				plan: { product_slug: 'free_plan' }
			} );
			assert.lengthOf( UpdatedStore, 0 );
		} );

		it( 'Should not set value of the site if NOT_ALLOWED_TO_RECEIVE_PLUGINS errors', () => {
			let UpdatedStore;
			Dispatcher.handleServerAction( actions.fetchedNotAllowed );
			UpdatedStore = PluginsStore.getPlugins( { ID: 123 } );
			assert.isDefined( UpdatedStore );
			assert.lengthOf( UpdatedStore, 0 );
		} );

		it( 'Should not be set as "fetching" after NOT_ALLOWED_TO_RECEIVE_PLUGINS is triggered', () => {
			Dispatcher.handleServerAction( actions.fetchedNotAllowed );
			assert.isFalse( PluginsStore.isFetchingSite( { ID: 123 } ) );
		} );
	} );

	describe( 'Fetch Plugins Again', () => {
		before( () => {
			Dispatcher.handleServerAction( actions.fetched );
		} );

		it( 'should contain the list of latest plugins', () => {
			const Plugins = PluginsStore.getSitePlugins( site );
			let PluginsAgain = [];

			assert.lengthOf( Plugins, 4 );

			// Lets check if we can update the plugin list to something new.
			Dispatcher.handleServerAction( actions.fetchedAgain );
			PluginsAgain = PluginsStore.getSitePlugins( site );
			assert.lengthOf( PluginsAgain, 2 );
		} );

		after( () => {
			// Return things to the way they were.
			Dispatcher.handleServerAction( actions.fetched );
		} );
	} );

	describe( 'Fetch Plugins MultiSite', () => {
		before( () => {
			Dispatcher.handleServerAction( actions.fetchedMultiSite );
		} );

		it( 'should contain the list of latest plugins', () => {
			const Plugins = PluginsStore.getSitePlugins( multiSite );
			assert.lengthOf( Plugins, 3 );
		} );

		after( () => {
			// Return things to the way they were.
			Dispatcher.handleServerAction( actions.fetched );
		} );
	} );

	describe( 'Remove Plugin', () => {
		let Plugins;

		before( () => {
			Dispatcher.handleServerAction( actions.fetched );
			Plugins = PluginsStore.getPlugins( [ site ] );
		} );

		it( 'it should remove the plugin from the sites list', () => {
			let PluginsAfterRemoval;
			Dispatcher.handleServerAction( actions.removedPlugin );
			PluginsAfterRemoval = PluginsStore.getPlugins( [ site ] );
			assert.equal( Plugins.length, PluginsAfterRemoval.length + 1 );
		} );

		it( 'it should bring the plugin back if there is an error while removing the plugin', () => {
			let PluginsAfterRemoval;
			Dispatcher.handleViewAction( actions.removedPluginError );
			PluginsAfterRemoval = PluginsStore.getPlugins( [ site ] );
			assert.equal( Plugins.length, PluginsAfterRemoval.length );
		} );
	} );

	describe( 'Update Plugin', () => {
		let HelloDolly;

		describe( 'Updating Plugin', () => {
			beforeEach( () => {
				Dispatcher.handleViewAction( actions.updatePlugin );
				HelloDolly = PluginsStore.getSitePlugin( site, 'hello-dolly' );
			} );

			it( 'doesn\'t remove update when lauched', () => {
				assert.isNotNull( HelloDolly.update );
			} );
		} );

		describe( 'Successfully Plugin Update', () => {
			// just eat the timer sets, we're not testing that part yet
			useFakeTimers();

			beforeEach( () => {
				Dispatcher.handleViewAction( actions.updatedPlugin );
				HelloDolly = PluginsStore.getSitePlugin( site, 'hello-dolly' );
			} );

			it( 'should set lastUpdated', () => {
				assert.isNotNull( HelloDolly.update.lastUpdated );
			} );

			it( 'should update the plugin data', () => {
				assert.equal( HelloDolly.version, updatePluginData.version );
				assert.equal( HelloDolly.author, updatePluginData.author );
				assert.equal( HelloDolly.description, updatePluginData.description );
				assert.equal( HelloDolly.author_url, updatePluginData.author_url );
				assert.equal( HelloDolly.name, updatePluginData.name );
			} );
		} );

		describe( 'Remove Plugin Update Info', () => {
			beforeEach( () => {
				Dispatcher.handleViewAction( actions.clearPluginUpdate );
				HelloDolly = PluginsStore.getSitePlugin( site, 'hello-dolly' );
			} );

			it( 'should remove lastUpdated', () => {
				assert.isNull( HelloDolly.update );
			} );
		} );

		describe( 'Failed Plugin Update', () => {
			beforeEach( () => {
				Dispatcher.handleViewAction( actions.updatedPluginError );
				HelloDolly = PluginsStore.getSitePlugin( site, 'hello-dolly' );
			} );

			it( 'should set update to an object', () => {
				assert.isObject( HelloDolly.update );
			} );
		} );
	} );

	describe( 'Activate Plugin', () => {
		describe( 'Activaiting Plugin', () => {
			it( 'Should set active = true if plugin is being activated', () => {
				Dispatcher.handleViewAction( actions.activatePlugin );
				assert.isTrue( PluginsStore.getSitePlugin( site, 'developer' ).active );
			} );
		} );

		describe( 'Succesfully Activated Plugin', () => {
			it( 'Should set active = true', () => {
				Dispatcher.handleViewAction( actions.activatedPlugin );
				assert.isTrue( PluginsStore.getSitePlugin( site, 'developer' ).active );
			} );
		} );

		describe( 'Error while Activating Plugin', () => {
			it( 'Should set active = false', () => {
				Dispatcher.handleServerAction( actions.activatedPluginError );
				assert.isFalse( PluginsStore.getSitePlugin( site, 'developer' ).active );
			} );
		} );

		describe( 'Error while Activating Plugin with activation_error', () => {
			it( 'Should set active = true if plugin is being activated with error plugin already active', () => {
				Dispatcher.handleServerAction( actions.activatedPluginErrorAlreadyActive );
				assert.isTrue( PluginsStore.getSitePlugin( site, 'developer' ).active );
			} );
		} );

		describe( 'Error while Activating Broken Plugin', () => {
			it( 'Should set active = false', () => {
				Dispatcher.handleServerAction( actions.activatedBrokenPluginError );
				assert.isFalse( PluginsStore.getSitePlugin( site, 'developer' ).active );
			} );
		} );
	} );

	describe( 'Deactivate Plugin', () => {
		describe( 'Deactivating Plugin', () => {
			it( 'Should set active = false if plugin is being activated', () => {
				Dispatcher.handleViewAction( actions.deactivatePlugin );
				assert.isFalse( PluginsStore.getSitePlugin( site, 'developer' ).active );
			} );
		} );

		describe( 'Succesfully Deactivated Plugin', () => {
			it( 'Should set active = false', () => {
				Dispatcher.handleViewAction( actions.deactivatedPlugin );
				assert.isFalse( PluginsStore.getSitePlugin( site, 'developer' ).active );
			} );
		} );

		describe( 'Error while Deactivating Plugin', () => {
			it( 'Should set active = true', () => {
				Dispatcher.handleServerAction( actions.deactivatedPluginError );
				assert.isTrue( PluginsStore.getSitePlugin( site, 'developer' ).active );
			} );
		} );

		describe( 'Error while Deactivating Plugin with deactivation_error', () => {
			it( 'Should set active = false if plugin is being deactivated with error plugin already deactived', () => {
				Dispatcher.handleServerAction( actions.deactivatedPluginErrorAlreadyNotActive );
				assert.isFalse( PluginsStore.getSitePlugin( site, 'developer' ).active );
			} );
		} );
	} );

	describe( 'Enable AutoUpdates for Plugin', () => {
		it( 'Should set autoupdate = true if autoupdates are being enabled', () => {
			Dispatcher.handleViewAction( actions.enableAutoupdatePlugin );
			assert.isTrue( PluginsStore.getSitePlugin( site, 'developer' ).autoupdate );
		} );

		it( 'Should set autoupdate = true after autoupdates enabling was successfully', () => {
			Dispatcher.handleServerAction( actions.enabledAutoupdatePlugin );
			assert.isTrue( PluginsStore.getSitePlugin( site, 'developer' ).autoupdate );
		} );

		it( 'Should set autoupdate = false after autoupdates enabling errored ', () => {
			Dispatcher.handleServerAction( actions.enabledAutoupdatePluginError );
			assert.isFalse( PluginsStore.getSitePlugin( site, 'developer' ).autoupdate );
		} );
	} );

	describe( 'Disable AutoUpdated for Plugins', () => {
		it( 'Should set autoupdate = false if autoupdates are being disabled', () => {
			Dispatcher.handleViewAction( actions.disableAutoupdatePlugin );
			assert.isFalse( PluginsStore.getSitePlugin( site, 'developer' ).autoupdate, false );
		} );

		it( 'Should set autoupdate = false after autoupdates disabling was successfully', () => {
			Dispatcher.handleServerAction( actions.disabledAutoupdatePlugin );
			assert.isFalse( PluginsStore.getSitePlugin( site, 'developer' ).autoupdate, false );
		} );

		it( 'Should set autoupdate = true after autoupdates disabling errored ', () => {
			Dispatcher.handleServerAction( actions.disabledAutoupdatePluginError );
			assert.isTrue( PluginsStore.getSitePlugin( site, 'developer' ).autoupdate, true );
		} );
	} );
} );
