/**
 * External dependencies
 */
var assert = require( 'chai' ).assert,
	mockery = require( 'mockery' );

/**
 * Internal dependencies
 */
var mockedWporg = require( 'lib/mock-wporg' );

describe( 'WPorg Data Actions', function() {
	var WPorgActions;

	before( function() {
		mockery.enable( {
			warnOnReplace: false,
			warnOnUnregistered: false
		} );
		mockery.registerMock( 'lib/wporg', mockedWporg );
		mockery.registerMock( 'lodash/function/debounce', function( cb ) {
			return cb;
		} );
	} );

	after( function() {
		mockery.disable();
	} );

	beforeEach( function() {
		WPorgActions = require( 'lib/plugins/wporg-data/actions' );
		WPorgActions.reset();
		mockedWporg.reset();
	} );

	it( 'Actions should be an object', function() {
		assert.isObject( WPorgActions );
	} );

	it( 'Actions should have method fetchPluginsList', function() {
		assert.isFunction( WPorgActions.fetchPluginsList );
	} );

	it( 'Actions should have method fetchNextCategoryPage', function() {
		assert.isFunction( WPorgActions.fetchNextCategoryPage );
	} );

	it( 'when fetching a plugin list, it shouldn\'t do the wporg request if there\'s a previous one still not finished for the same category', function() {
		mockedWporg.deactivatedCallbacks = true;
		WPorgActions.fetchPluginsList( 'new', 1 );
		WPorgActions.fetchPluginsList( 'new', 1 );
		assert.equal( mockedWporg.getActivity().fetchPluginsList, 1 );
	} );

	it( 'when fetching for the next page, the next page number should be calculated automatically', function() {
		WPorgActions.fetchPluginsList( 'new', 1 );
		WPorgActions.fetchNextCategoryPage( 'new' );
		assert.equal( mockedWporg.getActivity().lastRequestParams.page, 2 );
	} );

	it( 'when fetching for the next page, it should do a request if the next page is not over the number of total pages', function() {
		WPorgActions.fetchPluginsList( 'new', 1 );
		WPorgActions.fetchNextCategoryPage( 'new' );
		assert.equal( mockedWporg.getActivity().fetchPluginsList, 2 );
	} );

	it( 'when fetching for the next page, it should not do any request if the next page is over the number of total pages', function() {
		mockedWporg.mockedNumberOfReturnedPages = 1;
		WPorgActions.fetchPluginsList( 'new', 1 );
		WPorgActions.fetchNextCategoryPage( 'new' );
		assert.equal( mockedWporg.getActivity().fetchPluginsList, 1 );
	} );
} );
