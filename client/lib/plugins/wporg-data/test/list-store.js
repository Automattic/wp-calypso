/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import actionsData from './fixtures/actions';
import actionsSpies from './mocks/actions';
import Dispatcher from 'calypso/dispatcher';
import PluginsListsStore from 'calypso/lib/plugins/wporg-data/list-store';

jest.mock( 'config', () => ( {
	isEnabled: () => true,
} ) );
jest.mock( 'lib/plugins/wporg-data/actions', () => require( './mocks/actions' ) );

describe( 'WPORG Plugins Lists Store', () => {
	let pluginsList;

	function resetListsStore() {
		Dispatcher.handleServerAction( { type: 'RESET_WPORG_PLUGINS_LIST' } );
	}

	beforeEach( () => {
		actionsSpies.fetchPluginsList.resetHistory();
		resetListsStore();
	} );

	test( 'Store should be an object', () => {
		assert.isObject( PluginsListsStore );
	} );

	test( 'Store should have method emitChange', () => {
		assert.isFunction( PluginsListsStore.emitChange );
	} );

	test( 'Store should have method getShortList', () => {
		assert.isFunction( PluginsListsStore.getShortList );
	} );

	test( 'Store should have method getFullList', () => {
		assert.isFunction( PluginsListsStore.getFullList );
	} );

	test( 'should return if a list is fetching or not when requested', () => {
		pluginsList = PluginsListsStore.getFullList( 'popular' );
		assert.isDefined( pluginsList.fetching );
	} );

	test( 'Store should have method getSearchList', () => {
		assert.isFunction( PluginsListsStore.getSearchList );
	} );

	test( 'should return the content of a list when requested', () => {
		pluginsList = PluginsListsStore.getFullList( 'popular' );
		assert.isDefined( pluginsList.list );
	} );

	describe( 'short lists', () => {
		test( 'should be empty if the list has not been fetched yet', () => {
			const newPlugins = PluginsListsStore.getShortList( 'new' );
			assert.lengthOf( newPlugins.list, 0 );
		} );

		test( 'should return a list of plugins if the list has been fetched already', () => {
			Dispatcher.handleServerAction( actionsData.fetchedNewPluginsList );
			const newPlugins = PluginsListsStore.getShortList( 'new' );
			assert.isArray( newPlugins.list );
			assert.lengthOf( newPlugins.list, 1 );
		} );

		test( 'should not fetch from wporg if the category list is already in store', () => {
			Dispatcher.handleServerAction( actionsData.fetchedPopularPluginsList );
			PluginsListsStore.getShortList( 'popular' );
			assert.isFalse( actionsSpies.fetchPluginsList.called );
		} );

		test( 'should fetch from wporg if the category list is not already in store', () => {
			PluginsListsStore.getShortList( 'popular' );
			assert.isTrue( actionsSpies.fetchPluginsList.called );
		} );
	} );

	describe( 'Full lists', () => {
		test( 'should be empty if the list has not been fetched yet', () => {
			const newPlugins = PluginsListsStore.getFullList( 'new' );
			assert.lengthOf( newPlugins.list, 0 );
		} );

		test( 'should be populated after the processing a list fetched event', () => {
			Dispatcher.handleServerAction( actionsData.fetchedNewPluginsList );
			const newPlugins = PluginsListsStore.getFullList( 'new' );
			assert.isArray( newPlugins.list );
			assert.lengthOf( newPlugins.list, 1 );
		} );

		test( 'should fetch for the list when the fullList is requested', () => {
			PluginsListsStore.getFullList( 'popular' );
			assert.isTrue( actionsSpies.fetchPluginsList.called );
		} );

		test( 'should mark a list as `not being fetched`  when the fetch ends', () => {
			Dispatcher.handleViewAction( actionsData.fetchingPopularPluginsList );
			Dispatcher.handleServerAction( actionsData.fetchedPopularPluginsList );
			pluginsList = PluginsListsStore.getFullList( 'popular' );
			assert.notOk( pluginsList.fetching );
		} );

		test( 'should mark a list as `being fetched`  when the fetch begin', () => {
			Dispatcher.handleViewAction( actionsData.fetchingPopularPluginsList );
			pluginsList = PluginsListsStore.getFullList( 'popular' );
			assert.ok( pluginsList.fetching );
		} );

		test( 'should append the content of the response to the list when the requested page is not the first', () => {
			Dispatcher.handleServerAction( actionsData.fetchedNewPluginsList );
			Dispatcher.handleServerAction( actionsData.fetchedNewPluginsListSecondPage );
			pluginsList = PluginsListsStore.getFullList( 'new' );
			assert.lengthOf( pluginsList.list, 2 );
		} );

		test( 'should not mark a list as `not being fetched` when the fetch of a different list ends', () => {
			Dispatcher.handleViewAction( actionsData.fetchingPopularPluginsList );
			Dispatcher.handleServerAction( actionsData.fetchedNewPluginsList );
			pluginsList = PluginsListsStore.getFullList( 'popular' );
			assert.ok( pluginsList.fetching );
		} );

		test( 'should overwrite the list with the content of the request when the requested page is the first', () => {
			Dispatcher.handleServerAction( actionsData.fetchedNewPluginsList );
			Dispatcher.handleServerAction( actionsData.fetchedNewPluginsList );
			pluginsList = PluginsListsStore.getFullList( 'new' );
			assert.lengthOf( pluginsList.list, 1 );
		} );
	} );

	describe( 'Search lists', () => {
		test( 'should be empty if the search list has not been fetched yet', () => {
			const newPlugins = PluginsListsStore.getSearchList( 'test' );
			assert.lengthOf( newPlugins.list, 0 );
		} );

		test( 'should be populated after the processing a search list fetched event', () => {
			PluginsListsStore.getSearchList( 'test' );
			Dispatcher.handleServerAction( actionsData.fetchedSearchPluginsList );
			const searchPlugins = PluginsListsStore.getSearchList( 'test' );
			assert.isArray( searchPlugins.list );
			assert.lengthOf( searchPlugins.list, 1 );
		} );

		test( 'should fetch for the search list when the search is requested', () => {
			PluginsListsStore.getSearchList( 'test' );
			assert.isTrue( actionsSpies.fetchPluginsList.called );
		} );

		test( 'should mark a search list as `not being fetched`  when the fetch ends', () => {
			PluginsListsStore.getSearchList( 'test' );
			Dispatcher.handleViewAction( actionsData.fetchedSearchPluginsList );
			Dispatcher.handleServerAction( actionsData.fetchedSearchPluginsList );
			pluginsList = PluginsListsStore.getSearchList( 'test' );
			assert.notOk( pluginsList.fetching );
		} );

		test( 'should mark a search list as `being fetched` when the fetch begin', () => {
			Dispatcher.handleViewAction( actionsData.fetchingSearchPluginsList );
			pluginsList = PluginsListsStore.getSearchList( 'test' );
			assert.ok( pluginsList.fetching );
		} );

		test( 'should append the content of the response to the search list when the requested page is not the first', () => {
			PluginsListsStore.getSearchList( 'test' );
			Dispatcher.handleViewAction( actionsData.fetchedSearchPluginsList );
			Dispatcher.handleViewAction( actionsData.fetchedSearchPluginsListSecondPage );
			pluginsList = PluginsListsStore.getSearchList( 'test' );
			assert.lengthOf( pluginsList.list, 2 );
		} );

		test( 'should not mark a search list as `not being fetched` when the fetch of a different list ends', () => {
			Dispatcher.handleViewAction( actionsData.fetchingSearchPluginsList );
			Dispatcher.handleServerAction( actionsData.fetchedNewPluginsList );
			pluginsList = PluginsListsStore.getSearchList( 'test' );
			assert.ok( pluginsList.fetching );
		} );

		test( 'should overwrite the search list with the content of the request when the requested page is the first', () => {
			PluginsListsStore.getSearchList( 'test' );
			Dispatcher.handleViewAction( actionsData.fetchedSearchPluginsList );
			Dispatcher.handleViewAction( actionsData.fetchedSearchPluginsList );
			pluginsList = PluginsListsStore.getSearchList( 'test' );
			assert.lengthOf( pluginsList.list, 1 );
		} );

		test( 'should not repeat a search if the search term is the same', () => {
			pluginsList = PluginsListsStore.getSearchList( 'test' );
			pluginsList = PluginsListsStore.getSearchList( 'test' );
			assert.isTrue( actionsSpies.fetchPluginsList.called );
		} );

		test( 'should repeat a search if the search term is the different', () => {
			pluginsList = PluginsListsStore.getSearchList( 'test' );
			pluginsList = PluginsListsStore.getSearchList( 'not-a-test' );
			assert.isTrue( actionsSpies.fetchPluginsList.calledTwice );
		} );
	} );
} );
