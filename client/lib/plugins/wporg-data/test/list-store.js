/** @format */
/**
 * External dependencies
 */
import actionsData from './fixtures/actions';
import actionsSpies from './mocks/actions';
import Dispatcher from 'dispatcher';
import PluginsListsStore from 'lib/plugins/wporg-data/list-store';

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
		actionsSpies.fetchPluginsList.reset();
		resetListsStore();
	} );

	test( 'Store should be an object', () => {
		expect( typeof PluginsListsStore ).toBe( 'object' );
	} );

	test( 'Store should have method emitChange', () => {
		expect( typeof PluginsListsStore.emitChange ).toBe( 'function' );
	} );

	test( 'Store should have method getShortList', () => {
		expect( typeof PluginsListsStore.getShortList ).toBe( 'function' );
	} );

	test( 'Store should have method getFullList', () => {
		expect( typeof PluginsListsStore.getFullList ).toBe( 'function' );
	} );

	test( 'should return if a list is fetching or not when requested', () => {
		pluginsList = PluginsListsStore.getFullList( 'popular' );
		expect( pluginsList.fetching ).toBeDefined();
	} );

	test( 'Store should have method getSearchList', () => {
		expect( typeof PluginsListsStore.getSearchList ).toBe( 'function' );
	} );

	test( 'should return the content of a list when requested', () => {
		pluginsList = PluginsListsStore.getFullList( 'popular' );
		expect( pluginsList.list ).toBeDefined();
	} );

	describe( 'short lists', () => {
		test( 'should be empty if the list has not been fetched yet', () => {
			const newPlugins = PluginsListsStore.getShortList( 'new' );
			expect( newPlugins.list.length ).toBe( 0 );
		} );

		test( 'should return a list of plugins if the list has been fetched already', () => {
			Dispatcher.handleServerAction( actionsData.fetchedNewPluginsList );
			const newPlugins = PluginsListsStore.getShortList( 'new' );
			expect( Array.isArray( newPlugins.list ) ).toBe( true );
			expect( newPlugins.list.length ).toBe( 1 );
		} );

		test( 'should not fetch from wporg if the category list is already in store', () => {
			Dispatcher.handleServerAction( actionsData.fetchedPopularPluginsList );
			PluginsListsStore.getShortList( 'popular' );
			expect( actionsSpies.fetchPluginsList.called ).toBe( false );
		} );

		test( 'should fetch from wporg if the category list is not already in store', () => {
			PluginsListsStore.getShortList( 'popular' );
			expect( actionsSpies.fetchPluginsList.called ).toBe( true );
		} );
	} );

	describe( 'Full lists', () => {
		test( 'should be empty if the list has not been fetched yet', () => {
			const newPlugins = PluginsListsStore.getFullList( 'new' );
			expect( newPlugins.list.length ).toBe( 0 );
		} );

		test( 'should be populated after the processing a list fetched event', () => {
			let newPlugins;
			Dispatcher.handleServerAction( actionsData.fetchedNewPluginsList );
			newPlugins = PluginsListsStore.getFullList( 'new' );
			expect( Array.isArray( newPlugins.list ) ).toBe( true );
			expect( newPlugins.list.length ).toBe( 1 );
		} );

		test( 'should fetch for the list when the fullList is requested', () => {
			PluginsListsStore.getFullList( 'popular' );
			expect( actionsSpies.fetchPluginsList.called ).toBe( true );
		} );

		test( 'should mark a list as `not being fetched`  when the fetch ends', () => {
			Dispatcher.handleViewAction( actionsData.fetchingPopularPluginsList );
			Dispatcher.handleServerAction( actionsData.fetchedPopularPluginsList );
			pluginsList = PluginsListsStore.getFullList( 'popular' );
			expect( pluginsList.fetching ).toBeFalsy();
		} );

		test( 'should mark a list as `being fetched`  when the fetch begin', () => {
			Dispatcher.handleViewAction( actionsData.fetchingPopularPluginsList );
			pluginsList = PluginsListsStore.getFullList( 'popular' );
			expect( pluginsList.fetching ).toBeTruthy();
		} );

		test( 'should append the content of the response to the list when the requested page is not the first', () => {
			Dispatcher.handleServerAction( actionsData.fetchedNewPluginsList );
			Dispatcher.handleServerAction( actionsData.fetchedNewPluginsListSecondPage );
			pluginsList = PluginsListsStore.getFullList( 'new' );
			expect( pluginsList.list.length ).toBe( 2 );
		} );

		test( 'should not mark a list as `not being fetched` when the fetch of a different list ends', () => {
			Dispatcher.handleViewAction( actionsData.fetchingPopularPluginsList );
			Dispatcher.handleServerAction( actionsData.fetchedNewPluginsList );
			pluginsList = PluginsListsStore.getFullList( 'popular' );
			expect( pluginsList.fetching ).toBeTruthy();
		} );

		test( 'should overwrite the list with the content of the request when the requested page is the first', () => {
			Dispatcher.handleServerAction( actionsData.fetchedNewPluginsList );
			Dispatcher.handleServerAction( actionsData.fetchedNewPluginsList );
			pluginsList = PluginsListsStore.getFullList( 'new' );
			expect( pluginsList.list.length ).toBe( 1 );
		} );
	} );

	describe( 'Search lists', () => {
		test( 'should be empty if the search list has not been fetched yet', () => {
			const newPlugins = PluginsListsStore.getSearchList( 'test' );
			expect( newPlugins.list.length ).toBe( 0 );
		} );

		test( 'should be populated after the processing a search list fetched event', () => {
			let searchPlugins;
			PluginsListsStore.getSearchList( 'test' );
			Dispatcher.handleServerAction( actionsData.fetchedSearchPluginsList );
			searchPlugins = PluginsListsStore.getSearchList( 'test' );
			expect( Array.isArray( searchPlugins.list ) ).toBe( true );
			expect( searchPlugins.list.length ).toBe( 1 );
		} );

		test( 'should fetch for the search list when the search is requested', () => {
			PluginsListsStore.getSearchList( 'test' );
			expect( actionsSpies.fetchPluginsList.called ).toBe( true );
		} );

		test( 'should mark a search list as `not being fetched`  when the fetch ends', () => {
			PluginsListsStore.getSearchList( 'test' );
			Dispatcher.handleViewAction( actionsData.fetchedSearchPluginsList );
			Dispatcher.handleServerAction( actionsData.fetchedSearchPluginsList );
			pluginsList = PluginsListsStore.getSearchList( 'test' );
			expect( pluginsList.fetching ).toBeFalsy();
		} );

		test( 'should mark a search list as `being fetched` when the fetch begin', () => {
			Dispatcher.handleViewAction( actionsData.fetchingSearchPluginsList );
			pluginsList = PluginsListsStore.getSearchList( 'test' );
			expect( pluginsList.fetching ).toBeTruthy();
		} );

		test( 'should append the content of the response to the search list when the requested page is not the first', () => {
			PluginsListsStore.getSearchList( 'test' );
			Dispatcher.handleViewAction( actionsData.fetchedSearchPluginsList );
			Dispatcher.handleViewAction( actionsData.fetchedSearchPluginsListSecondPage );
			pluginsList = PluginsListsStore.getSearchList( 'test' );
			expect( pluginsList.list.length ).toBe( 2 );
		} );

		test( 'should not mark a search list as `not being fetched` when the fetch of a different list ends', () => {
			Dispatcher.handleViewAction( actionsData.fetchingSearchPluginsList );
			Dispatcher.handleServerAction( actionsData.fetchedNewPluginsList );
			pluginsList = PluginsListsStore.getSearchList( 'test' );
			expect( pluginsList.fetching ).toBeTruthy();
		} );

		test( 'should overwrite the search list with the content of the request when the requested page is the first', () => {
			PluginsListsStore.getSearchList( 'test' );
			Dispatcher.handleViewAction( actionsData.fetchedSearchPluginsList );
			Dispatcher.handleViewAction( actionsData.fetchedSearchPluginsList );
			pluginsList = PluginsListsStore.getSearchList( 'test' );
			expect( pluginsList.list.length ).toBe( 1 );
		} );

		test( 'should not repeat a search if the search term is the same', () => {
			pluginsList = PluginsListsStore.getSearchList( 'test' );
			pluginsList = PluginsListsStore.getSearchList( 'test' );
			expect( actionsSpies.fetchPluginsList.called ).toBe( true );
		} );

		test( 'should repeat a search if the search term is the different', () => {
			pluginsList = PluginsListsStore.getSearchList( 'test' );
			pluginsList = PluginsListsStore.getSearchList( 'not-a-test' );
			expect( actionsSpies.fetchPluginsList.calledTwice ).toBe( true );
		} );
	} );
} );
