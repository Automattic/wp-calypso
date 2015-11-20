/**
 * External dependencies
 */
var assert = require( 'chai' ).assert;

/**
 * Internal dependencies
 */
var actions = require( './lib/mock-actions' ),
	site = require( './lib/mock-site' ),
	siteId = site.ID;

require( 'lib/react-test-env-setup' )();

describe( 'Viewers Store', function() {
	var Dispatcher, ViewersStore;

	beforeEach( function() {
		Dispatcher = require( 'dispatcher' );
		ViewersStore = require( '../store' );
	} );

	describe( 'Shape of store', function() {
		it( 'Store should be an object', function() {
			assert.isObject( ViewersStore );
		} );

		it( 'Store should have method emitChange', function() {
			assert.isFunction( ViewersStore.emitChange );
		} );

		it( 'Store should have method getViewers', function() {
			assert.isFunction( ViewersStore.getViewers );
		} );

		it( 'Store should have method getPaginationData', function() {
			assert.isFunction( ViewersStore.getPaginationData );
		} );
	} );

	describe( 'Get Viewers', function() {
		it( 'Should return false when viewers haven\'t been fetched', function() {
			var viewers = ViewersStore.getViewers( siteId );

			assert( false === viewers, 'viewers is false' );
		} );

		it( 'Should return an array of objects when there are viewers', function() {
			var viewers;

			Dispatcher.handleServerAction( actions.fetchedViewers );
			viewers = ViewersStore.getViewers( siteId );

			assert( Array.isArray( viewers ), 'viewers is an array' );
			assert.isObject( viewers[0] );
		} );
	} );

	describe( 'Fetch Viewers', function() {
		beforeEach( function() {
			Dispatcher.handleServerAction( actions.fetchedViewers );
		} );

		it( 'Fetching zero users should not affect store size', function() {
			var viewers = ViewersStore.getViewers( siteId ),
				viewersAgain;

			Dispatcher.handleServerAction( actions.fetchedViewersEmpty );
			viewersAgain = ViewersStore.getViewers( siteId );
			assert.equal( viewers.length, viewersAgain.length, 'the viewers store was not affected' );
		} );

		it( 'Fetching more viewers should increase the store size', function() {
			var viewers = ViewersStore.getViewers( siteId ),
				viewersAgain;

			Dispatcher.handleServerAction( actions.fetchedMoreViewers );
			viewersAgain = ViewersStore.getViewers( siteId );
			assert.notEqual( viewersAgain.length, viewers.length, 'the viewers store increased' );
		} );

		it( 'Pagination data should update fetching more viewers', function() {
			var pagination = ViewersStore.getPaginationData( siteId );

			assert.equal( pagination.totalViewers, 4 );
			assert.equal( pagination.numViewersFetched, 2 );
			assert.equal( pagination.currentViewersPage, 1 );

			Dispatcher.handleServerAction( actions.fetchedMoreViewers );

			pagination = ViewersStore.getPaginationData( siteId );
			assert.equal( pagination.numViewersFetched, 4 );
			assert.equal( pagination.currentViewersPage, 2 );
		} );
	} );

	describe( 'Removing a viewer', function() {
		beforeEach( function() {
			Dispatcher.handleServerAction( actions.fetchedViewers );
		} );

		it( 'Should remove a single viewer.', function() {
			var viewers = ViewersStore.getViewers( siteId ),
				viewersAgain;

			assert.equal( viewers.length, 2 );
			Dispatcher.handleServerAction( actions.removeViewer );
			viewersAgain = ViewersStore.getViewers( siteId );
			assert.equal( viewersAgain.length, 1 );
		} );

		it( 'Should restore a single viewer on removal error.', function() {
			var viewers = ViewersStore.getViewers( siteId ),
				viewersAfterRemove,
				viewersAfterError;
			assert.equal( viewers.length, 2 );
			Dispatcher.handleServerAction( actions.removeViewer );
			viewersAfterRemove = ViewersStore.getViewers( siteId );
			assert.equal( viewersAfterRemove.length, 1 );
			Dispatcher.handleServerAction( actions.removeViewerError );
			viewersAfterError = ViewersStore.getViewers( siteId );
			assert.equal( viewersAfterError.length, 2 );
		} );
	} );
} );
