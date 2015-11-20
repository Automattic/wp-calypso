/**
 * External dependencies
 */
var assert = require( 'chai' ).assert,
	mockery = require( 'mockery' );

/**
 * Internal dependencies
 */
var plugins = require( 'lib/mock-plugins' ),
	site = require( 'lib/mock-site' ),
	multiSite = require( 'lib/mock-multi-site' ),
	actions = require( 'lib/mock-actions' ),
	updatePluginData = require( 'lib/mock-updated-plugin' ),
	mockedSitesList = require( './lib/mock-sites-list' );

/**
 * setup a react test enviroment
 */
require( 'lib/react-test-env-setup' )();

describe( 'Plugins Store', function() {
	var Dispatcher, PluginsStore;

	before( function() {
		mockery.enable( {
			warnOnReplace: false,
			warnOnUnregistered: false
		} );
		mockery.registerMock( 'lib/sites-list', mockedSitesList );
	} );

	after( function() {
		mockery.disable();
	} );

	beforeEach( function() {
		Dispatcher = require( 'dispatcher' );
		PluginsStore = require( 'lib/plugins/store' );
	} );

	it( 'Store should be an object', function() {
		assert.isObject( PluginsStore );
	} );

	it( 'Store should have method emitChange', function() {
		assert.isFunction( PluginsStore.emitChange );
	} );

	describe( 'Fetch Plugins', function() {
		beforeEach( function() {
			Dispatcher.handleServerAction( actions.fetched );
		} );

		it( 'Should update the store on RECEIVE_PLUGINS', function() {
			assert.isNotNull( PluginsStore.getSitePlugins( site ) );
		} );

		describe( 'getPlugin method', function() {
			it( 'Store should have method getPlugin', function() {
				assert.isFunction( PluginsStore.getPlugin );
			} );

			it( 'should return an object', function() {
				assert.isObject( PluginsStore.getPlugin( site, 'akismet' ) );
			} );

			it( 'should accept sites as an array of objects or object', function() {
				assert.deepEqual( PluginsStore.getPlugin( site, 'akismet' ), PluginsStore.getPlugin( [ site ], 'akismet' ) );
			} );

			it( 'should return an object with attribute sites array', function() {
				var Plugin = PluginsStore.getPlugin( site, 'akismet' );
				assert.isArray( Plugin.sites );
			} );
		} );

		describe( 'getPlugins method', function() {
			it( 'Store should have method getPlugins', function() {
				assert.isFunction( PluginsStore.getPlugins );
			} );

			it( 'should return an array of objects', function() {
				assert.isArray( PluginsStore.getPlugins( site ) );
				assert.isObject( PluginsStore.getPlugins( site )[ 0 ] );
			} );

			it( 'should return an object with attribute sites array', function() {
				var Plugins = PluginsStore.getPlugins( site );
				assert.isArray( Plugins[ 0 ].sites );
				assert.isObject( Plugins[ 0 ].sites[ 0 ] );
			} );

			it( 'should return the same object as getPlugin', function() {
				var Plugins = PluginsStore.getPlugins( site );
				var Plugin = PluginsStore.getPlugin( site, Plugins[ 0 ].slug );
				assert.deepEqual( Plugins[ 0 ], Plugin );
			} );

			it( 'should return active Plugins', function() {
				var Plugins = PluginsStore.getPlugins( site, 'active' );
				var Plugin = PluginsStore.getPlugin( site, Plugins[ 0 ].slug );
				assert.deepEqual( Plugins[ 0 ], Plugin );
				assert.isTrue( Plugins[ 0 ].active );
			} );

			it( 'should return inactive Plugins', function() {
				var Plugins = PluginsStore.getPlugins( site, 'inactive' );
				var Plugin = PluginsStore.getPlugin( site, Plugins[ 0 ].slug );
				assert.deepEqual( Plugins[ 0 ], Plugin );
				assert.isFalse( Plugins[ 0 ].active );
			} );

			it( 'should return needs update Plugins', function() {
				var Plugins = PluginsStore.getPlugins( site, 'updates' );
				var Plugin = PluginsStore.getPlugin( site, Plugins[ 0 ].slug );
				assert.deepEqual( Plugins[ 0 ], Plugin );
				assert.isObject( Plugins[ 0 ].update );
			} );

			it( 'should return all Plugin', function() {
				var Plugins = PluginsStore.getPlugins( site, 'all' );
				assert.equal( Plugins.length, plugins.length );
			} );

			it( 'should return none Plugin', function() {
				var Plugins = PluginsStore.getPlugins( site, 'none' );
				assert.equal( Plugins.length, 0 );
			} );
		} );

		describe( 'getSitePlugin method', function() {
			it( 'Store should have method getSitePlugin', function() {
				assert.isFunction( PluginsStore.getSitePlugin );
			} );

			it( 'Should have return a plugin object for a site', function() {
				var Aksimet = PluginsStore.getSitePlugin( site, 'akismet' );
				assert.isObject( Aksimet );
			} );

			it( 'Should have return undefiend for a site if the plugin doesn\'t exits', function() {
				assert.isUndefined( PluginsStore.getSitePlugin( site, 'non-plugin-slug' ) );
			} );
		} );

		describe( 'getSitePlugins method', function() {
			it( 'Store should have method getSitePlugins', function() {
				assert.isFunction( PluginsStore.getSitePlugins );
			} );

			it( 'Should have return Array of Objects', function() {
				var Plugins = PluginsStore.getSitePlugins( site );
				assert.isArray( Plugins );
				assert.isObject( Plugins[ 0 ] );
			} );

			it( 'Should have return undefiend if site doesn\'t exits', function() {
				assert.isUndefined( PluginsStore.getSitePlugins( {
					ID: 1,
					jetpack: false,
					plan: { product_slug: 'free_plan' }
				} ) );
			} );
		} );

		describe( 'getSites method', function() {
			it( 'Store should have method getSites', function() {
				assert.isFunction( PluginsStore.getSites );
			} );

			it( 'Should return Array of Objects', function() {
				var Sites = PluginsStore.getSites( site, 'akismet' );
				assert.isArray( Sites );
				assert.isObject( Sites[ 0 ] );
			} );

			it( 'Should return Array of Objects that has the pluginSlug as a attribute', function() {
				var Sites = PluginsStore.getSites( site, 'akismet' );
				assert.isArray( Sites );
				assert.isObject( Sites[ 0 ] );
				assert.equal( Sites[ 0 ].plugin.slug, 'akismet' );
			} );
		} );

		it( 'Should not set value of the site if RECEIVE_PLUGINS errors', function() {
			var UpdatedStore;
			Dispatcher.handleServerAction( actions.fetchedError );
			UpdatedStore = PluginsStore.getPlugins( {
				ID: 123,
				jetpack: false,
				plan: { product_slug: 'free_plan' }
			} );
			assert.isUndefined( UpdatedStore );
		} );

		it( 'Should not set value of the site if NOT_ALLOWED_TO_RECEIVE_PLUGINS errors', function() {
			var UpdatedStore;
			Dispatcher.handleServerAction( actions.fetchedNotAllowed );
			UpdatedStore = PluginsStore.getPlugins( { ID: 123 } );
			assert.isDefined( UpdatedStore );
			assert.equal( UpdatedStore.length, 0 );
		} );

		it( 'Should not be set as "fetching" after NOT_ALLOWED_TO_RECEIVE_PLUGINS is triggered', function() {
			Dispatcher.handleServerAction( actions.fetchedNotAllowed );
			assert.equal( PluginsStore.isFetchingSite( { ID: 123 } ), false );
		} );
	} );

	describe( 'Fetch Plugins Again', function() {
		before( function() {
			Dispatcher.handleServerAction( actions.fetched );
		} );

		it( 'should contain the list of latest plugins', function() {
			var Plugins = PluginsStore.getSitePlugins( site ),
				PluginsAgain = [];

			assert.equal( Plugins.length, 4 );

			// Lets check if we can update the plugin list to something new.
			Dispatcher.handleServerAction( actions.fetchedAgain );
			PluginsAgain = PluginsStore.getSitePlugins( site );
			assert.equal( PluginsAgain.length, 2 );
		} );

		after( function() {
			// Return things to the way they were.
			Dispatcher.handleServerAction( actions.fetched );
		} );
	} );

	describe( 'Fetch Plugins MultiSite', function() {
		before( function() {
			Dispatcher.handleServerAction( actions.fetchedMultiSite );
		} );

		it( 'should contain the list of latest plugins', function() {
			var Plugins = PluginsStore.getSitePlugins( multiSite );
			assert.equal( Plugins.length, 3 );
		} );

		after( function() {
			// Return things to the way they were.
			Dispatcher.handleServerAction( actions.fetched );
		} );
	} );

	describe( 'Toggle Plugin Selection', function() {
		describe( 'Select Plugin', function() {
			before( function() {
				Dispatcher.handleServerAction( actions.togglePluginSelection );
			} );

			it( 'should return a plugin selected', function() {
				var HelloDolly = PluginsStore.getPlugin( [ site ], 'hello-dolly' );
				assert.isTrue( HelloDolly.selected );
			} );

			it( 'getPlugins should return a unselected plugin', function() {
				var Plugins = PluginsStore.getPlugins( [ site ] );
				assert.isTrue( Plugins[ 2 ].selected );
			} );
		} );

		describe( 'Deselect Plugin', function() {
			before( function() {
				Dispatcher.handleServerAction( actions.togglePluginSelection );
			} );

			it( 'getPlugin should return a un selected plugin', function() {
				var HelloDolly = PluginsStore.getPlugin( [ site ], 'hello-dolly' );
				assert.isUndefined( HelloDolly.selected );
			} );

			it( 'getPlugins should return a unselected plugin', function() {
				var Plugins = PluginsStore.getPlugins( [ site ] );
				assert.isUndefined( Plugins[ 2 ].selected );
			} );
		} );
	} );

	describe( 'Plugin Selection', function() {
		describe( 'Select All Plugins', function() {
			before( function() {
				Dispatcher.handleServerAction( actions.selectPluginsAll );
			} );

			it( 'getPlugin should return a plugin selected', function() {
				var HelloDolly = PluginsStore.getPlugin( [ site ], 'hello-dolly' );
				assert.isTrue( HelloDolly.selected );
			} );

			it( 'getPlugins should return only selected plugin', function() {
				var Plugins = PluginsStore.getPlugins( [ site ] );
				Plugins.forEach( function( plugin ) {
					assert.isTrue( plugin.selected );
				} );
			} );
		} );

		describe( 'Select No Plugins', function() {
			before( function() {
				Dispatcher.handleServerAction( actions.selectPluginsNone );
			} );

			it( 'getPlugin should return a selected plugin', function() {
				var HelloDolly = PluginsStore.getPlugin( [ site ], 'hello-dolly' );
				assert.isUndefined( HelloDolly.selected );
				assert.isUndefined( HelloDolly.selected );
			} );

			it( 'getPlugins should return a unselected plugin', function() {
				var Plugins = PluginsStore.getPlugins( [ site ] );
				Plugins.forEach( function( plugin ) {
					assert.isUndefined( plugin.selected );
				} );
			} );
		} );

		describe( 'Select Need Updates Plugins', function() {
			before( function() {
				Dispatcher.handleServerAction( actions.selectPluginsNeedUpdate );
			} );

			it( 'getPlugin should return a un selected plugin', function() {
				var HelloDolly = PluginsStore.getPlugin( [ site ], 'hello-dolly' );
				assert.isTrue( HelloDolly.selected );
			} );

			it( 'getPlugins should return a selected plugin that need update', function() {
				var Plugins = PluginsStore.getPlugins( [ site ] );
				Plugins.forEach( function( plugin ) {
					if ( plugin.update ) {
						assert.isTrue( plugin.selected );
					} else {
						assert.isUndefined( plugin.selected );
					}
				} );
			} );
		} );
	} );

	describe( 'Remove Plugin', function() {
		var Plugins;

		before( function() {
			Dispatcher.handleServerAction( actions.fetched );
			Plugins = PluginsStore.getPlugins( [ site ] );
		} );
		it( 'it should remove the plugin from the sites list', function() {
			var PluginsAfterRemoval;
			Dispatcher.handleServerAction( actions.removedPlugin );
			PluginsAfterRemoval = PluginsStore.getPlugins( [ site ] );
			assert.isTrue( Plugins.length === PluginsAfterRemoval.length + 1 );
		} );

		it( 'it should bring the plugin back if there is an error while removing the plugin', function() {
			var PluginsAfterRemoval;
			Dispatcher.handleViewAction( actions.removedPluginError );
			PluginsAfterRemoval = PluginsStore.getPlugins( [ site ] );
			assert.isTrue( Plugins.length === PluginsAfterRemoval.length );
		} );
	} );

	describe( 'Update Plugin', function() {
		var HelloDolly = {};

		describe( 'Updateing Plugin', function() {
			beforeEach( function() {
				Dispatcher.handleViewAction( actions.updatePlugin );
				HelloDolly = PluginsStore.getSitePlugin( site, 'hello-dolly' );
			} );

			it( 'update = null', function() {
				assert.isNull( HelloDolly.update );
			} );
		} );

		describe( 'Successfully Plugin Update', function() {
			beforeEach( function() {
				Dispatcher.handleViewAction( actions.updatedPlugin );
				HelloDolly = PluginsStore.getSitePlugin( site, 'hello-dolly' );
			} );

			it( 'should set update = null', function() {
				assert.isNull( HelloDolly.update );
			} );

			it( 'should update the plugin data', function() {
				assert.equal( HelloDolly.version, updatePluginData.version );
				assert.equal( HelloDolly.author, updatePluginData.author );
				assert.equal( HelloDolly.description, updatePluginData.description );
				assert.equal( HelloDolly.author_url, updatePluginData.author_url );
				assert.equal( HelloDolly.name, updatePluginData.name );
			} );
		} );

		describe( 'Failed Plugin Update', function() {
			beforeEach( function() {
				Dispatcher.handleViewAction( actions.updatedPluginError );
				HelloDolly = PluginsStore.getSitePlugin( site, 'hello-dolly' );
			} );

			it( 'should set update to an object', function() {
				assert.isObject( HelloDolly.update );
			} );
		} );
	} );

	describe( 'Activate Plugin', function() {
		describe( 'Activaiting Plugin', function() {
			it( 'Should set active = true if plugin is being activated', function() {
				Dispatcher.handleViewAction( actions.activatePlugin );
				assert.isTrue( PluginsStore.getSitePlugin( site, 'developer' ).active );
			} );
		} );

		describe( 'Succesfully Activated Plugin', function() {
			it( 'Should set active = true', function() {
				Dispatcher.handleViewAction( actions.activatedPlugin );
				assert.isTrue( PluginsStore.getSitePlugin( site, 'developer' ).active );
			} );
		} );

		describe( 'Error while Activating Plugin', function() {
			it( 'Should set active = false', function() {
				Dispatcher.handleServerAction( actions.activatedPluginError );
				assert.isFalse( PluginsStore.getSitePlugin( site, 'developer' ).active );
			} );
		} );

		describe( 'Error while Activating Plugin with activation_error', function() {
			it( 'Should set active = true if plugin is being activated with error plugin already active', function() {
				Dispatcher.handleServerAction( actions.activatedPluginErrorAlreadyActive );
				assert.isTrue( PluginsStore.getSitePlugin( site, 'developer' ).active );
			} );
		} );

		describe( 'Error while Activating Broken Plugin', function() {
			it( 'Should set active = false', function() {
				Dispatcher.handleServerAction( actions.activatedBrokenPluginError );
				assert.isFalse( PluginsStore.getSitePlugin( site, 'developer' ).active );
			} );
		} );
	} );

	describe( 'Deactivate Plugin', function() {
		describe( 'Deactivating Plugin', function() {
			it( 'Should set active = false if plugin is being activated', function() {
				Dispatcher.handleViewAction( actions.deactivatePlugin );
				assert.isFalse( PluginsStore.getSitePlugin( site, 'developer' ).active );
			} );
		} );

		describe( 'Succesfully Deactivated Plugin', function() {
			it( 'Should set active = false', function() {
				Dispatcher.handleViewAction( actions.deactivatedPlugin );
				assert.isFalse( PluginsStore.getSitePlugin( site, 'developer' ).active );
			} );
		} );

		describe( 'Error while Deactivating Plugin', function() {
			it( 'Should set active = true', function() {
				Dispatcher.handleServerAction( actions.deactivatedPluginError );
				assert.isTrue( PluginsStore.getSitePlugin( site, 'developer' ).active );
			} );
		} );

		describe( 'Error while Deactivating Plugin with deactivation_error', function() {
			it( 'Should set active = false if plugin is being deactivated with error plugin already deactived', function() {
				Dispatcher.handleServerAction( actions.deactivatedPluginErrorAlreadyNotActive );
				assert.isFalse( PluginsStore.getSitePlugin( site, 'developer' ).active );
			} );
		} );
	} );

	describe( 'Enable AutoUpdates for Plugin', function() {
		it( 'Should set autoupdate = true if autoupdates are being enabled', function() {
			Dispatcher.handleViewAction( actions.enableAutoupdatePlugin );
			assert.isTrue( PluginsStore.getSitePlugin( site, 'developer' ).autoupdate );
		} );

		it( 'Should set autoupdate = true after autoupdates enabling was successfully', function() {
			Dispatcher.handleServerAction( actions.enabledAutoupdatePlugin );
			assert.isTrue( PluginsStore.getSitePlugin( site, 'developer' ).autoupdate );
		} );

		it( 'Should set autoupdate = false after autoupdates enabling errored ', function() {
			Dispatcher.handleServerAction( actions.enabledAutoupdatePluginError );
			assert.isFalse( PluginsStore.getSitePlugin( site, 'developer' ).autoupdate );
		} );
	} );

	describe( 'Disable AutoUpdated for Plugins', function() {
		it( 'Should set autoupdate = false if autoupdates are being disabled', function() {
			Dispatcher.handleViewAction( actions.disableAutoupdatePlugin );
			assert.isFalse( PluginsStore.getSitePlugin( site, 'developer' ).autoupdate, false );
		} );

		it( 'Should set autoupdate = false after autoupdates disabling was successfully', function() {
			Dispatcher.handleServerAction( actions.disabledAutoupdatePlugin );
			assert.isFalse( PluginsStore.getSitePlugin( site, 'developer' ).autoupdate, false );
		} );

		it( 'Should set autoupdate = true after autoupdates disabling errored ', function() {
			Dispatcher.handleServerAction( actions.disabledAutoupdatePluginError );
			assert.isTrue( PluginsStore.getSitePlugin( site, 'developer' ).autoupdate, true );
		} );
	} );
} );
