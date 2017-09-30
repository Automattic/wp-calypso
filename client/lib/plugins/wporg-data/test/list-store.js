jest.mock( 'config', () => ( {
	isEnabled: () => true
} ) );
jest.mock( 'store', () => require( './mocks/local-store' ) );
jest.mock( 'lib/plugins/wporg-data/actions', () => require( './mocks/actions' ) );

/**
 * External dependencies
 */
import { assert } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import actionsData from './fixtures/actions';
import actionsSpies from './mocks/actions';
import Dispatcher from 'dispatcher';
import localStorageSpies from './mocks/local-store';
import PluginsListsStore from 'lib/plugins/wporg-data/list-store';

describe( 'WPORG Plugins Lists Store', () => {
	let pluginsList;

	function resetListsStore() {
		Dispatcher.handleServerAction( { type: 'RESET_WPORG_PLUGINS_LIST' } );
	}

	beforeEach( () => {
		localStorageSpies.reset();
		actionsSpies.fetchPluginsList.reset();
		resetListsStore();
	} );

	it( 'Store should be an object', () => {
		assert.isObject( PluginsListsStore );
	} );

	it( 'Store should have method emitChange', () => {
		assert.isFunction( PluginsListsStore.emitChange );
	} );

	it( 'Store should have method getShortList', () => {
		assert.isFunction( PluginsListsStore.getShortList );
	} );

	it( 'Store should have method getFullList', () => {
		assert.isFunction( PluginsListsStore.getFullList );
	} );

	it( 'should return if a list is fetching or not when requested', () => {
		pluginsList = PluginsListsStore.getFullList( 'popular' );
		assert.isDefined( pluginsList.fetching );
	} );

	it( 'Store should have method getSearchList', () => {
		assert.isFunction( PluginsListsStore.getSearchList );
	} );

	it( 'should return the content of a list when requested', () => {
		pluginsList = PluginsListsStore.getFullList( 'popular' );
		assert.isDefined( pluginsList.list );
	} );

	describe( 'short lists', () => {
		it( 'should be empty if the list has not been fetched yet', () => {
			const newPlugins = PluginsListsStore.getShortList( 'new' );
			assert.lengthOf( newPlugins.list, 0 );
		} );

		it( 'should return a list of plugins if the list has been fetched already', () => {
			let newPlugins;
			Dispatcher.handleServerAction( actionsData.fetchedNewPluginsList );
			newPlugins = PluginsListsStore.getShortList( 'new' );
			assert.isArray( newPlugins.list );
			assert.lengthOf( newPlugins.list, 1 );
		} );

		it( 'should not read from localStorage if the category isn\'t in the to-be-cached list', () => {
			Dispatcher.handleServerAction( actionsData.fetchedNewPluginsList );
			resetListsStore();
			PluginsListsStore.getShortList( 'new' );
			assert.isFalse( localStorageSpies.get.called );
		} );

		it( 'should not store on localStorage if the category isn\'t in the to-be-cached list', () => {
			Dispatcher.handleServerAction( actionsData.fetchedNewPluginsList );
			assert.isFalse( localStorageSpies.set.called );
		} );

		it( 'should try to read from localStorage if the category is in the to-be-cached list', () => {
			Dispatcher.handleServerAction( actionsData.fetchedPopularPluginsList );
			resetListsStore();
			PluginsListsStore.getShortList( 'popular' );
			assert.isTrue( localStorageSpies.get.called );
		} );

		it( 'should not be stored on localStorage if the category isn\'t in the to-be-cached list', () => {
			Dispatcher.handleServerAction( actionsData.fetchedPopularPluginsList );
			resetListsStore();
			PluginsListsStore.getShortList( 'popular' );
			assert.isTrue( localStorageSpies.set.called );
		} );

		it( 'should not fetch from wporg if the category list is already in storage and is not yet after its TTL', () => {
			resetListsStore();
			Dispatcher.handleServerAction( actionsData.fetchedPopularPluginsList );
			PluginsListsStore.getShortList( 'popular' );
			assert.isFalse( actionsSpies.fetchPluginsList.called );
		} );

		it( 'should fetch from wporg if the category list is not already in storage', () => {
			PluginsListsStore.getShortList( 'popular' );
			assert.isTrue( actionsSpies.fetchPluginsList.called );
		} );

		it( 'should always fetch from wporg if the category list is non on the to-be-cached list', () => {
			Dispatcher.handleServerAction( actionsData.fetchedNewPluginsList );
			resetListsStore();
			PluginsListsStore.getShortList( 'new' );
			assert.isTrue( actionsSpies.fetchPluginsList.called );
		} );

		it( 'should fetch from wporg if the category list is already in storage but it\'s already after its TTL', () => {
			const clock = sinon.useFakeTimers();
			Dispatcher.handleServerAction( actionsData.fetchedPopularPluginsList );
			resetListsStore();
			clock.tick( 60 * 60 * 1000 ); // an hour "passes"
			PluginsListsStore.getShortList( 'popular' );
			assert.isTrue( actionsSpies.fetchPluginsList.called );
			clock.restore();
		} );
	} );

	describe( 'Full lists', () => {
		it( 'should be empty if the list has not been fetched yet', () => {
			const newPlugins = PluginsListsStore.getFullList( 'new' );
			assert.lengthOf( newPlugins.list, 0 );
		} );

		it( 'should be populated after the processing a list fetched event', () => {
			let newPlugins;
			Dispatcher.handleServerAction( actionsData.fetchedNewPluginsList );
			newPlugins = PluginsListsStore.getFullList( 'new' );
			assert.isArray( newPlugins.list );
			assert.lengthOf( newPlugins.list, 1 );
		} );

		it( 'should fetch for the list when the fullList is requested', () => {
			PluginsListsStore.getFullList( 'popular' );
			assert.isTrue( actionsSpies.fetchPluginsList.called );
		} );

		it( 'should mark a list as `not being fetched`  when the fetch ends', () => {
			Dispatcher.handleViewAction( actionsData.fetchingPopularPluginsList );
			Dispatcher.handleServerAction( actionsData.fetchedPopularPluginsList );
			pluginsList = PluginsListsStore.getFullList( 'popular' );
			assert.notOk( pluginsList.fetching );
		} );

		it( 'should mark a list as `being fetched`  when the fetch begin', () => {
			Dispatcher.handleViewAction( actionsData.fetchingPopularPluginsList );
			pluginsList = PluginsListsStore.getFullList( 'popular' );
			assert.ok( pluginsList.fetching );
		} );

		it( 'should append the content of the response to the list when the requested page is not the first', () => {
			Dispatcher.handleServerAction( actionsData.fetchedNewPluginsList );
			Dispatcher.handleServerAction( actionsData.fetchedNewPluginsListSecondPage );
			pluginsList = PluginsListsStore.getFullList( 'new' );
			assert.lengthOf( pluginsList.list, 2 );
		} );

		it( 'should not mark a list as `not being fetched` when the fetch of a different list ends', () => {
			Dispatcher.handleViewAction( actionsData.fetchingPopularPluginsList );
			Dispatcher.handleServerAction( actionsData.fetchedNewPluginsList );
			pluginsList = PluginsListsStore.getFullList( 'popular' );
			assert.ok( pluginsList.fetching );
		} );

		it( 'should overwrite the list with the content of the request when the requested page is the first', () => {
			Dispatcher.handleServerAction( actionsData.fetchedNewPluginsList );
			Dispatcher.handleServerAction( actionsData.fetchedNewPluginsList );
			pluginsList = PluginsListsStore.getFullList( 'new' );
			assert.lengthOf( pluginsList.list, 1 );
		} );
	} );

	describe( 'Search lists', () => {
		it( 'should be empty if the search list has not been fetched yet', () => {
			const newPlugins = PluginsListsStore.getSearchList( 'test' );
			assert.lengthOf( newPlugins.list, 0 );
		} );

		it( 'should be populated after the processing a search list fetched event', () => {
			let searchPlugins;
			PluginsListsStore.getSearchList( 'test' );
			Dispatcher.handleServerAction( actionsData.fetchedSearchPluginsList );
			searchPlugins = PluginsListsStore.getSearchList( 'test' );
			assert.isArray( searchPlugins.list );
			assert.lengthOf( searchPlugins.list, 1 );
		} );

		it( 'should fetch for the search list when the search is requested', () => {
			PluginsListsStore.getSearchList( 'test' );
			assert.isTrue( actionsSpies.fetchPluginsList.called );
		} );

		it( 'should mark a search list as `not being fetched`  when the fetch ends', () => {
			PluginsListsStore.getSearchList( 'test' );
			Dispatcher.handleViewAction( actionsData.fetchedSearchPluginsList );
			Dispatcher.handleServerAction( actionsData.fetchedSearchPluginsList );
			pluginsList = PluginsListsStore.getSearchList( 'test' );
			assert.notOk( pluginsList.fetching );
		} );

		it( 'should mark a search list as `being fetched` when the fetch begin', () => {
			Dispatcher.handleViewAction( actionsData.fetchingSearchPluginsList );
			pluginsList = PluginsListsStore.getSearchList( 'test' );
			assert.ok( pluginsList.fetching );
		} );

		it( 'should append the content of the response to the search list when the requested page is not the first', () => {
			PluginsListsStore.getSearchList( 'test' );
			Dispatcher.handleViewAction( actionsData.fetchedSearchPluginsList );
			Dispatcher.handleViewAction( actionsData.fetchedSearchPluginsListSecondPage );
			pluginsList = PluginsListsStore.getSearchList( 'test' );
			assert.lengthOf( pluginsList.list, 2 );
		} );

		it( 'should not mark a search list as `not being fetched` when the fetch of a different list ends', () => {
			Dispatcher.handleViewAction( actionsData.fetchingSearchPluginsList );
			Dispatcher.handleServerAction( actionsData.fetchedNewPluginsList );
			pluginsList = PluginsListsStore.getSearchList( 'test' );
			assert.ok( pluginsList.fetching );
		} );

		it( 'should overwrite the search list with the content of the request when the requested page is the first', () => {
			PluginsListsStore.getSearchList( 'test' );
			Dispatcher.handleViewAction( actionsData.fetchedSearchPluginsList );
			Dispatcher.handleViewAction( actionsData.fetchedSearchPluginsList );
			pluginsList = PluginsListsStore.getSearchList( 'test' );
			assert.lengthOf( pluginsList.list, 1 );
		} );

		it( 'should not repeat a search if the search term is the same', () => {
			pluginsList = PluginsListsStore.getSearchList( 'test' );
			pluginsList = PluginsListsStore.getSearchList( 'test' );
			assert.isTrue( actionsSpies.fetchPluginsList.called );
		} );

		it( 'should repeat a search if the search term is the different', () => {
			pluginsList = PluginsListsStore.getSearchList( 'test' );
			pluginsList = PluginsListsStore.getSearchList( 'not-a-test' );
			assert.isTrue( actionsSpies.fetchPluginsList.calledTwice );
		} );
	} );
} );
