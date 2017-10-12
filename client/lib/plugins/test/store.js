/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import actions from './fixtures/actions';
import multiSite from './fixtures/multi-site';
import plugins from './fixtures/plugins';
import site from './fixtures/site';
import updatePluginData from './fixtures/updated-plugin';
import Dispatcher from 'dispatcher';
import PluginsStore from 'lib/plugins/store';
import { useFakeTimers } from 'test/helpers/use-sinon';

jest.mock( 'lib/sites-list', () => require( './mocks/sites-list' ) );
jest.mock( 'lib/analytics', () => ( {} ) );

describe( 'Plugins Store', () => {
	test( 'Store should be an object', () => {
		expect( typeof PluginsStore ).toBe( 'object' );
	} );

	test( 'Store should have method emitChange', () => {
		expect( typeof PluginsStore.emitChange ).toBe( 'function' );
	} );

	describe( 'Fetch Plugins', () => {
		beforeEach( () => {
			Dispatcher.handleServerAction( actions.fetched );
		} );

		test( 'Should update the store on RECEIVE_PLUGINS', () => {
			expect( PluginsStore.getSitePlugins( site ) ).not.toBeNull();
		} );

		describe( 'getPlugin method', () => {
			test( 'Store should have method getPlugin', () => {
				expect( typeof PluginsStore.getPlugin ).toBe( 'function' );
			} );

			test( 'should return an object', () => {
				expect( typeof PluginsStore.getPlugin( site, 'akismet' ) ).toBe( 'object' );
			} );

			test( 'should accept sites as an array of objects or object', () => {
				expect( PluginsStore.getPlugin( site, 'akismet' ) ).toEqual(
					PluginsStore.getPlugin( [ site ], 'akismet' )
				);
			} );

			test( 'should return an object with attribute sites array', () => {
				const Plugin = PluginsStore.getPlugin( site, 'akismet' );
				expect( Array.isArray( Plugin.sites ) ).toBe( true );
			} );
		} );

		describe( 'getPlugins method', () => {
			test( 'Store should have method getPlugins', () => {
				expect( typeof PluginsStore.getPlugins ).toBe( 'function' );
			} );

			test( 'should return an array of objects', () => {
				const Plugins = PluginsStore.getPlugins( site );
				expect( Array.isArray( Plugins ) ).toBe( true );
				expect( typeof Plugins[ 0 ] ).toBe( 'object' );
			} );

			test( 'should return an object with attribute sites array', () => {
				const Plugins = PluginsStore.getPlugins( site );
				expect( Array.isArray( Plugins[ 0 ].sites ) ).toBe( true );
				expect( typeof Plugins[ 0 ].sites[ 0 ] ).toBe( 'object' );
			} );

			test( 'should return the same object as getPlugin', () => {
				const Plugins = PluginsStore.getPlugins( site ),
					Plugin = PluginsStore.getPlugin( site, Plugins[ 0 ].slug );
				expect( Plugins[ 0 ] ).toEqual( Plugin );
			} );

			test( 'should return active Plugins', () => {
				const Plugins = PluginsStore.getPlugins( site, 'active' ),
					Plugin = PluginsStore.getPlugin( site, Plugins[ 0 ].slug );
				expect( Plugins[ 0 ] ).toEqual( Plugin );
				expect( Plugins[ 0 ].active ).toBe( true );
			} );

			test( 'should return inactive Plugins', () => {
				const Plugins = PluginsStore.getPlugins( site, 'inactive' ),
					Plugin = PluginsStore.getPlugin( site, Plugins[ 0 ].slug );
				expect( Plugins[ 0 ] ).toEqual( Plugin );
				expect( Plugins[ 0 ].active ).toBe( false );
			} );

			test( 'should return needs update Plugins', () => {
				const Plugins = PluginsStore.getPlugins( site, 'updates' ),
					Plugin = PluginsStore.getPlugin( site, Plugins[ 0 ].slug );
				expect( Plugins[ 0 ] ).toEqual( Plugin );
				expect( typeof Plugins[ 0 ].update ).toBe( 'object' );
			} );

			test( 'should return all Plugin', () => {
				const Plugins = PluginsStore.getPlugins( site, 'all' );
				expect( Plugins.length ).toEqual( plugins.length );
			} );

			test( 'should return none Plugin', () => {
				const Plugins = PluginsStore.getPlugins( site, 'none' );
				expect( Plugins.length ).toEqual( 0 );
			} );
		} );

		describe( 'getSitePlugin method', () => {
			test( 'Store should have method getSitePlugin', () => {
				expect( typeof PluginsStore.getSitePlugin ).toBe( 'function' );
			} );

			test( 'Should have return a plugin object for a site', () => {
				const Aksimet = PluginsStore.getSitePlugin( site, 'akismet' );
				expect( typeof Aksimet ).toBe( 'object' );
			} );

			test( "Should have return undefined for a site if the plugin doesn't exist", () => {
				expect( PluginsStore.getSitePlugin( site, 'non-plugin-slug' ) ).not.toBeDefined();
			} );
		} );

		describe( 'getSitePlugins method', () => {
			test( 'Store should have method getSitePlugins', () => {
				expect( typeof PluginsStore.getSitePlugins ).toBe( 'function' );
			} );

			test( 'Should have return Array of Objects', () => {
				const Plugins = PluginsStore.getSitePlugins( site );
				expect( Array.isArray( Plugins ) ).toBe( true );
				expect( typeof Plugins[ 0 ] ).toBe( 'object' );
			} );

			test( "Should have return undefined if site doesn't exist", () => {
				expect(
					PluginsStore.getSitePlugins( {
						ID: 1,
						jetpack: false,
						plan: { product_slug: 'free_plan' },
					} )
				).not.toBeDefined();
			} );
		} );

		describe( 'getSites method', () => {
			test( 'Store should have method getSites', () => {
				expect( typeof PluginsStore.getSites ).toBe( 'function' );
			} );

			test( 'Should return Array of Objects', () => {
				const Sites = PluginsStore.getSites( site, 'akismet' );
				expect( Array.isArray( Sites ) ).toBe( true );
				expect( typeof Sites[ 0 ] ).toBe( 'object' );
			} );

			test( 'Should return Array of Objects that has the pluginSlug as a attribute', () => {
				const Sites = PluginsStore.getSites( site, 'akismet' );
				expect( Array.isArray( Sites ) ).toBe( true );
				expect( typeof Sites[ 0 ] ).toBe( 'object' );
				expect( Sites[ 0 ].plugin.slug ).toEqual( 'akismet' );
			} );
		} );

		test( 'Should return an empty array if RECEIVE_PLUGINS errors', () => {
			Dispatcher.handleServerAction( actions.fetchedError );
			const UpdatedStore = PluginsStore.getPlugins( {
				ID: 123,
				jetpack: false,
				plan: { product_slug: 'free_plan' },
			} );
			expect( UpdatedStore.length ).toBe( 0 );
		} );

		test( 'Should not set value of the site if NOT_ALLOWED_TO_RECEIVE_PLUGINS errors', () => {
			Dispatcher.handleServerAction( actions.fetchedNotAllowed );
			const UpdatedStore = PluginsStore.getPlugins( { ID: 123 } );
			expect( UpdatedStore ).toBeDefined();
			expect( UpdatedStore.length ).toBe( 0 );
		} );

		test( 'Should not be set as "fetching" after NOT_ALLOWED_TO_RECEIVE_PLUGINS is triggered', () => {
			Dispatcher.handleServerAction( actions.fetchedNotAllowed );
			expect( PluginsStore.isFetchingSite( { ID: 123 } ) ).toBe( false );
		} );
	} );

	describe( 'Fetch Plugins Again', () => {
		beforeAll( () => {
			Dispatcher.handleServerAction( actions.fetched );
		} );

		test( 'should contain the list of latest plugins', () => {
			const Plugins = PluginsStore.getSitePlugins( site );
			let PluginsAgain = [];

			expect( Plugins.length ).toBe( 4 );

			// Lets check if we can update the plugin list to something new.
			Dispatcher.handleServerAction( actions.fetchedAgain );
			PluginsAgain = PluginsStore.getSitePlugins( site );
			expect( PluginsAgain.length ).toBe( 2 );
		} );

		afterAll( () => {
			// Return things to the way they were.
			Dispatcher.handleServerAction( actions.fetched );
		} );
	} );

	describe( 'Fetch Plugins MultiSite', () => {
		beforeAll( () => {
			Dispatcher.handleServerAction( actions.fetchedMultiSite );
		} );

		test( 'should contain the list of latest plugins', () => {
			const Plugins = PluginsStore.getSitePlugins( multiSite );
			expect( Plugins.length ).toBe( 3 );
		} );

		afterAll( () => {
			// Return things to the way they were.
			Dispatcher.handleServerAction( actions.fetched );
		} );
	} );

	describe( 'Remove Plugin', () => {
		let Plugins;

		beforeAll( () => {
			Dispatcher.handleServerAction( actions.fetched );
			Plugins = PluginsStore.getPlugins( [ site ] );
		} );

		test( 'it should remove the plugin from the sites list', () => {
			Dispatcher.handleServerAction( actions.removedPlugin );
			const PluginsAfterRemoval = PluginsStore.getPlugins( [ site ] );
			expect( Plugins.length ).toEqual( PluginsAfterRemoval.length + 1 );
		} );

		test( 'it should bring the plugin back if there is an error while removing the plugin', () => {
			Dispatcher.handleViewAction( actions.removedPluginError );
			const PluginsAfterRemoval = PluginsStore.getPlugins( [ site ] );
			expect( Plugins.length ).toEqual( PluginsAfterRemoval.length );
		} );
	} );

	describe( 'Update Plugin', () => {
		let HelloDolly;

		describe( 'Updating Plugin', () => {
			beforeEach( () => {
				Dispatcher.handleViewAction( actions.updatePlugin );
				HelloDolly = PluginsStore.getSitePlugin( site, 'hello-dolly' );
			} );

			test( "doesn't remove update when lauched", () => {
				expect( HelloDolly.update ).not.toBeNull();
			} );
		} );

		describe( 'Successfully Plugin Update', () => {
			// just eat the timer sets, we're not testing that part yet
			useFakeTimers();

			beforeEach( () => {
				Dispatcher.handleViewAction( actions.updatedPlugin );
				HelloDolly = PluginsStore.getSitePlugin( site, 'hello-dolly' );
			} );

			test( 'should set lastUpdated', () => {
				expect( HelloDolly.update.lastUpdated ).not.toBeNull();
			} );

			test( 'should update the plugin data', () => {
				expect( HelloDolly.version ).toEqual( updatePluginData.version );
				expect( HelloDolly.author ).toEqual( updatePluginData.author );
				expect( HelloDolly.description ).toEqual( updatePluginData.description );
				expect( HelloDolly.author_url ).toEqual( updatePluginData.author_url );
				expect( HelloDolly.name ).toEqual( updatePluginData.name );
			} );
		} );

		describe( 'Remove Plugin Update Info', () => {
			beforeEach( () => {
				Dispatcher.handleViewAction( actions.clearPluginUpdate );
				HelloDolly = PluginsStore.getSitePlugin( site, 'hello-dolly' );
			} );

			test( 'should remove lastUpdated', () => {
				expect( HelloDolly.update ).toBeNull();
			} );
		} );

		describe( 'Failed Plugin Update', () => {
			beforeEach( () => {
				Dispatcher.handleViewAction( actions.updatedPluginError );
				HelloDolly = PluginsStore.getSitePlugin( site, 'hello-dolly' );
			} );

			test( 'should set update to an object', () => {
				expect( typeof HelloDolly.update ).toBe( 'object' );
			} );
		} );
	} );

	describe( 'Activate Plugin', () => {
		describe( 'Activaiting Plugin', () => {
			test( 'Should set active = true if plugin is being activated', () => {
				Dispatcher.handleViewAction( actions.activatePlugin );
				expect( PluginsStore.getSitePlugin( site, 'developer' ).active ).toBe( true );
			} );
		} );

		describe( 'Succesfully Activated Plugin', () => {
			test( 'Should set active = true', () => {
				Dispatcher.handleViewAction( actions.activatedPlugin );
				expect( PluginsStore.getSitePlugin( site, 'developer' ).active ).toBe( true );
			} );
		} );

		describe( 'Error while Activating Plugin', () => {
			test( 'Should set active = false', () => {
				Dispatcher.handleServerAction( actions.activatedPluginError );
				expect( PluginsStore.getSitePlugin( site, 'developer' ).active ).toBe( false );
			} );
		} );

		describe( 'Error while Activating Plugin with activation_error', () => {
			test( 'Should set active = true if plugin is being activated with error plugin already active', () => {
				Dispatcher.handleServerAction( actions.activatedPluginErrorAlreadyActive );
				expect( PluginsStore.getSitePlugin( site, 'developer' ).active ).toBe( true );
			} );
		} );

		describe( 'Error while Activating Broken Plugin', () => {
			test( 'Should set active = false', () => {
				Dispatcher.handleServerAction( actions.activatedBrokenPluginError );
				expect( PluginsStore.getSitePlugin( site, 'developer' ).active ).toBe( false );
			} );
		} );
	} );

	describe( 'Deactivate Plugin', () => {
		describe( 'Deactivating Plugin', () => {
			test( 'Should set active = false if plugin is being activated', () => {
				Dispatcher.handleViewAction( actions.deactivatePlugin );
				expect( PluginsStore.getSitePlugin( site, 'developer' ).active ).toBe( false );
			} );
		} );

		describe( 'Succesfully Deactivated Plugin', () => {
			test( 'Should set active = false', () => {
				Dispatcher.handleViewAction( actions.deactivatedPlugin );
				expect( PluginsStore.getSitePlugin( site, 'developer' ).active ).toBe( false );
			} );
		} );

		describe( 'Error while Deactivating Plugin', () => {
			test( 'Should set active = true', () => {
				Dispatcher.handleServerAction( actions.deactivatedPluginError );
				expect( PluginsStore.getSitePlugin( site, 'developer' ).active ).toBe( true );
			} );
		} );

		describe( 'Error while Deactivating Plugin with deactivation_error', () => {
			test( 'Should set active = false if plugin is being deactivated with error plugin already deactived', () => {
				Dispatcher.handleServerAction( actions.deactivatedPluginErrorAlreadyNotActive );
				expect( PluginsStore.getSitePlugin( site, 'developer' ).active ).toBe( false );
			} );
		} );
	} );

	describe( 'Enable AutoUpdates for Plugin', () => {
		test( 'Should set autoupdate = true if autoupdates are being enabled', () => {
			Dispatcher.handleViewAction( actions.enableAutoupdatePlugin );
			expect( PluginsStore.getSitePlugin( site, 'developer' ).autoupdate ).toBe( true );
		} );

		test( 'Should set autoupdate = true after autoupdates enabling was successfully', () => {
			Dispatcher.handleServerAction( actions.enabledAutoupdatePlugin );
			expect( PluginsStore.getSitePlugin( site, 'developer' ).autoupdate ).toBe( true );
		} );

		test( 'Should set autoupdate = false after autoupdates enabling errored ', () => {
			Dispatcher.handleServerAction( actions.enabledAutoupdatePluginError );
			expect( PluginsStore.getSitePlugin( site, 'developer' ).autoupdate ).toBe( false );
		} );
	} );

	describe( 'Disable AutoUpdated for Plugins', () => {
		test( 'Should set autoupdate = false if autoupdates are being disabled', () => {
			Dispatcher.handleViewAction( actions.disableAutoupdatePlugin );
			expect( PluginsStore.getSitePlugin( site, 'developer' ).autoupdate ).toBe( false );
		} );

		test( 'Should set autoupdate = false after autoupdates disabling was successfully', () => {
			Dispatcher.handleServerAction( actions.disabledAutoupdatePlugin );
			expect( PluginsStore.getSitePlugin( site, 'developer' ).autoupdate ).toBe( false );
		} );

		test( 'Should set autoupdate = true after autoupdates disabling errored ', () => {
			Dispatcher.handleServerAction( actions.disabledAutoupdatePluginError );
			expect( PluginsStore.getSitePlugin( site, 'developer' ).autoupdate ).toBe( true );
		} );
	} );
} );
