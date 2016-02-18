/**
 * External dependencies
 */
var assert = require( 'chai' ).assert,
	mockery = require( 'mockery' ),
	sinon = require( 'sinon' );

/**
 * Internal dependencies
 */
var actionsData = require( 'lib/data-actions' ),
	actions = require( 'lib/mock-actions' ),
	localStorageMock = require( 'lib/mock-local-store' );

describe( 'WPORG Plugins Lists Store', function() {
	var Dispatcher, PluginsListsStore, pluginsList;

	function resetListsStore() {
		Dispatcher.handleServerAction( { type: 'RESET_WPORG_PLUGINS_LIST' } );
	}

	before( function() {
		mockery.enable( {
			warnOnReplace: false,
			warnOnUnregistered: false
		} );
		mockery.registerMock( 'lodash/debounce', function( cb ) {
			return cb;
		} );
		mockery.registerMock( 'store', localStorageMock );
		mockery.registerMock( 'config', {
			isEnabled: function() {
				return true;
			}
		} );
		mockery.registerMock( './actions', actions );
		mockery.registerMock( 'config', {
			isEnabled: function() {
				return true;
			}
		} );
	} );

	after( function() {
		mockery.disable();
	} );

	beforeEach( function() {
		localStorageMock.reset();
		actions.reset();
		Dispatcher = require( 'dispatcher' );
		PluginsListsStore = require( 'lib/plugins/wporg-data/list-store' );
		resetListsStore();
	} );

	it( 'Store should be an object', function() {
		assert.isObject( PluginsListsStore );
	} );

	it( 'Store should have method emitChange', function() {
		assert.isFunction( PluginsListsStore.emitChange );
	} );

	it( 'Store should have method getShortList', function() {
		assert.isFunction( PluginsListsStore.getShortList );
	} );

	it( 'Store should have method getFullList', function() {
		assert.isFunction( PluginsListsStore.getFullList );
	} );

	it( 'should return if a list is fetching or not when requested', function() {
		pluginsList = PluginsListsStore.getFullList( 'popular' );
		assert.isDefined( pluginsList.fetching );
	} );

	it( 'Store should have method getSearchList', function() {
		assert.isFunction( PluginsListsStore.getSearchList );
	} );

	it( 'should return the content of a list when requested', function() {
		pluginsList = PluginsListsStore.getFullList( 'popular' );
		assert.isDefined( pluginsList.list );
	} );

	describe( 'short lists', function() {
		it( 'should be empty if the list has not been fetched yet', function() {
			var newPlugins = PluginsListsStore.getShortList( 'new' );
			assert.equal( newPlugins.list.length, 0 );
		} );

		it( 'should return a list of plugins if the list has been fetched already', function() {
			var newPlugins;
			Dispatcher.handleServerAction( actionsData.fetchedNewPluginsList );
			newPlugins = PluginsListsStore.getShortList( 'new' );
			assert.isArray( newPlugins.list );
			assert.equal( newPlugins.list.length, 1 );
		} );

		it( 'should not read from localStorage if the category isn\'t in the to-be-cached list', function() {
			Dispatcher.handleServerAction( actionsData.fetchedNewPluginsList );
			resetListsStore();
			PluginsListsStore.getShortList( 'new' );
			assert.equal( localStorageMock.getActivity().get, 0 );
		} );

		it( 'should not store on localStorage if the category isn\'t in the to-be-cached list', function() {
			Dispatcher.handleServerAction( actionsData.fetchedNewPluginsList );
			assert.equal( localStorageMock.getActivity().set, 0 );
		} );

		it( 'should try to read from localStorage if the category is in the to-be-cached list', function() {
			Dispatcher.handleServerAction( actionsData.fetchedPopularPluginsList );
			resetListsStore();
			PluginsListsStore.getShortList( 'popular' );
			assert.notEqual( localStorageMock.getActivity().get, 0 );
		} );

		it( 'should not be stored on localStorage if the category isn\'t in the to-be-cached list', function() {
			Dispatcher.handleServerAction( actionsData.fetchedPopularPluginsList );
			resetListsStore();
			PluginsListsStore.getShortList( 'popular' );
			assert.equal( localStorageMock.getActivity().set, 1 );
		} );

		it( 'should not fetch from wporg if the category list is already in storage and is not yet after its TTL', function() {
			Dispatcher.handleServerAction( actionsData.fetchedPopularPluginsList );
			resetListsStore();
			PluginsListsStore.getShortList( 'popular' );
			assert.equal( actions.getActivity().fetchPluginsListCalled, 0 );
		} );

		it( 'should fetch from wporg if the category list is not already in storage', function() {
			PluginsListsStore.getShortList( 'popular' );
			assert.equal( actions.getActivity().fetchPluginsListCalled, 1 );
		} );

		it( 'should always fetch from wporg if the category list is non on the to-be-cached list', function() {
			Dispatcher.handleServerAction( actionsData.fetchedNewPluginsList );
			resetListsStore();
			PluginsListsStore.getShortList( 'new' );
			assert.equal( actions.getActivity().fetchPluginsListCalled, 1 );
		} );

		it( 'should fetch from wporg if the category list is already in storage but it\'s already after its TTL', function() {
			var clock = sinon.useFakeTimers();
			Dispatcher.handleServerAction( actionsData.fetchedPopularPluginsList );
			resetListsStore();
			clock.tick( 60 * 60 * 1000 ); // an hour "passes"
			PluginsListsStore.getShortList( 'popular' );
			assert.equal( actions.getActivity().fetchPluginsListCalled, 1 );
			clock.restore();
		} );
	} );

	describe( 'Full lists', function() {
		it( 'should be empty if the list has not been fetched yet', function() {
			var newPlugins = PluginsListsStore.getFullList( 'new' );
			assert.equal( newPlugins.list.length, 0 );
		} );

		it( 'should be populated after the processing a list fetched event', function() {
			var newPlugins;
			Dispatcher.handleServerAction( actionsData.fetchedNewPluginsList );
			newPlugins = PluginsListsStore.getFullList( 'new' );
			assert.isArray( newPlugins.list );
			assert.equal( newPlugins.list.length, 1 );
		} );

		it( 'should fetch for the list when the fullList is requested', function() {
			PluginsListsStore.getFullList( 'popular' );
			assert.equal( actions.getActivity().fetchPluginsListCalled, 1 );
		} );

		it( 'should mark a list as `not being fetched`  when the fetch ends', function() {
			Dispatcher.handleViewAction( actionsData.fetchingPopularPluginsList );
			Dispatcher.handleServerAction( actionsData.fetchedPopularPluginsList );
			pluginsList = PluginsListsStore.getFullList( 'popular' );
			assert.notOk( pluginsList.fetching );
		} );

		it( 'should mark a list as `being fetched`  when the fetch begin', function() {
			Dispatcher.handleViewAction( actionsData.fetchingPopularPluginsList );
			pluginsList = PluginsListsStore.getFullList( 'popular' );
			assert.ok( pluginsList.fetching );
		} );

		it( 'should append the content of the response to the list when the requested page is not the first', function() {
			Dispatcher.handleServerAction( actionsData.fetchedNewPluginsList );
			Dispatcher.handleServerAction( actionsData.fetchedNewPluginsListSecondPage );
			pluginsList = PluginsListsStore.getFullList( 'new' );
			assert.equal( pluginsList.list.length, 2 );
		} );

		it( 'should not mark a list as `not being fetched` when the fetch of a different list ends', function() {
			Dispatcher.handleViewAction( actionsData.fetchingPopularPluginsList );
			Dispatcher.handleServerAction( actionsData.fetchedNewPluginsList );
			pluginsList = PluginsListsStore.getFullList( 'popular' );
			assert.ok( pluginsList.fetching );
		} );

		it( 'should overwrite the list with the content of the request when the requested page is the first', function() {
			Dispatcher.handleServerAction( actionsData.fetchedNewPluginsList );
			Dispatcher.handleServerAction( actionsData.fetchedNewPluginsList );
			pluginsList = PluginsListsStore.getFullList( 'new' );
			assert.equal( pluginsList.list.length, 1 );
		} );
	} );

	describe( 'Search lists', function() {
		it( 'should be empty if the search list has not been fetched yet', function() {
			var newPlugins = PluginsListsStore.getSearchList( 'test' );
			assert.equal( newPlugins.list.length, 0 );
		} );

		it( 'should be populated after the processing a search list fetched event', function() {
			var searchPlugins;
			PluginsListsStore.getSearchList( 'test' );
			Dispatcher.handleServerAction( actionsData.fetchedSearchPluginsList );
			searchPlugins = PluginsListsStore.getSearchList( 'test' );
			assert.isArray( searchPlugins.list );
			assert.equal( searchPlugins.list.length, 1 );
		} );

		it( 'should fetch for the search list when the search is requested', function() {
			PluginsListsStore.getSearchList( 'test' );
			assert.equal( actions.getActivity().fetchPluginsListCalled, 1 );
		} );

		it( 'should mark a search list as `not being fetched`  when the fetch ends', function() {
			PluginsListsStore.getSearchList( 'test' );
			Dispatcher.handleViewAction( actionsData.fetchedSearchPluginsList );
			Dispatcher.handleServerAction( actionsData.fetchedSearchPluginsList );
			pluginsList = PluginsListsStore.getSearchList( 'test' );
			assert.notOk( pluginsList.fetching );
		} );

		it( 'should mark a search list as `being fetched` when the fetch begin', function() {
			Dispatcher.handleViewAction( actionsData.fetchingSearchPluginsList );
			pluginsList = PluginsListsStore.getSearchList( 'test' );
			assert.ok( pluginsList.fetching );
		} );

		it( 'should append the content of the response to the search list when the requested page is not the first', function() {
			PluginsListsStore.getSearchList( 'test' );
			Dispatcher.handleViewAction( actionsData.fetchedSearchPluginsList );
			Dispatcher.handleViewAction( actionsData.fetchedSearchPluginsListSecondPage );
			pluginsList = PluginsListsStore.getSearchList( 'test' );
			assert.equal( pluginsList.list.length, 2 );
		} );

		it( 'should not mark a search list as `not being fetched` when the fetch of a different list ends', function() {
			Dispatcher.handleViewAction( actionsData.fetchingSearchPluginsList );
			Dispatcher.handleServerAction( actionsData.fetchedNewPluginsList );
			pluginsList = PluginsListsStore.getSearchList( 'test' );
			assert.ok( pluginsList.fetching );
		} );

		it( 'should overwrite the search list with the content of the request when the requested page is the first', function() {
			PluginsListsStore.getSearchList( 'test' );
			Dispatcher.handleViewAction( actionsData.fetchedSearchPluginsList );
			Dispatcher.handleViewAction( actionsData.fetchedSearchPluginsList );
			pluginsList = PluginsListsStore.getSearchList( 'test' );
			assert.equal( pluginsList.list.length, 1 );
		} );

		it( 'should not repeat a search if the search term is the same', function() {
			pluginsList = PluginsListsStore.getSearchList( 'test' );
			pluginsList = PluginsListsStore.getSearchList( 'test' );
			assert.equal( actions.getActivity().fetchPluginsListCalled, 1 );
		} );

		it( 'should repeat a search if the search term is the different', function() {
			pluginsList = PluginsListsStore.getSearchList( 'test' );
			pluginsList = PluginsListsStore.getSearchList( 'not-a-test' );
			assert.equal( actions.getActivity().fetchPluginsListCalled, 2 );
		} );
	} );
} );
