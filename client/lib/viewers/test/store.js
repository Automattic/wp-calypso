/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import actions from './fixtures/actions';
import site from './fixtures/site';

describe( 'Viewers Store', () => {
	const siteId = site.ID;
	let Dispatcher, ViewersStore;

	useFakeDom();

	beforeEach( () => {
		Dispatcher = require( 'dispatcher' );
		ViewersStore = require( '../store' );
	} );

	describe( 'Shape of store', () => {
		it( 'Store should be an object', () => {
			assert.isObject( ViewersStore );
		} );

		it( 'Store should have method emitChange', () => {
			assert.isFunction( ViewersStore.emitChange );
		} );

		it( 'Store should have method getViewers', () => {
			assert.isFunction( ViewersStore.getViewers );
		} );

		it( 'Store should have method getPaginationData', () => {
			assert.isFunction( ViewersStore.getPaginationData );
		} );
	} );

	describe( 'Get Viewers', () => {
		it( 'Should return false when viewers haven\'t been fetched', () => {
			const viewers = ViewersStore.getViewers( siteId );

			assert.isFalse( viewers, 'viewers is false' );
		} );

		it( 'Should return an array of objects when there are viewers', () => {
			let viewers;

			Dispatcher.handleServerAction( actions.fetchedViewers );
			viewers = ViewersStore.getViewers( siteId );

			assert.isArray( viewers, 'viewers is an array' );
			assert.isObject( viewers[ 0 ] );
		} );
	} );

	describe( 'Fetch Viewers', () => {
		let viewers, viewersAgain;
		beforeEach( () => {
			Dispatcher.handleServerAction( actions.fetchedViewers );
			viewers = ViewersStore.getViewers( siteId );
		} );

		it( 'Fetching zero users should not affect store size', () => {
			Dispatcher.handleServerAction( actions.fetchedViewersEmpty );
			viewersAgain = ViewersStore.getViewers( siteId );
			assert.equal( viewers.length, viewersAgain.length, 'the viewers store was not affected' );
		} );

		it( 'Fetching more viewers should increase the store size', () => {
			Dispatcher.handleServerAction( actions.fetchedMoreViewers );
			viewersAgain = ViewersStore.getViewers( siteId );
			assert.notEqual( viewersAgain.length, viewers.length, 'the viewers store increased' );
		} );
	} );

	describe( 'Pagination', () => {
		let pagination;
		beforeEach( () => {
			Dispatcher.handleServerAction( actions.fetchedViewers );
			pagination = ViewersStore.getPaginationData( siteId );
		} );

		it( 'has the correct total viewers', () => {
			assert.equal( pagination.totalViewers, 4 );
		} );

		it( 'has the correct number of viewers fetched', () => {
			assert.equal( pagination.numViewersFetched, 2 );
		} );

		it( 'has the correct page', () => {
			assert.equal( pagination.currentViewersPage, 1 );
		} );

		context( 'after fetching more viewers', () => {
			beforeEach( () => {
				Dispatcher.handleServerAction( actions.fetchedMoreViewers );
				pagination = ViewersStore.getPaginationData( siteId );
			} );

			it( 'has the correct updated number of viewers fetched', () => {
				assert.equal( pagination.numViewersFetched, 4 );
			} );

			it( 'advances to the next page', () => {
				assert.equal( pagination.currentViewersPage, 2 );
			} );
		} );
	} );

	describe( 'Removing a viewer', () => {
		let viewersAgain;
		beforeEach( () => {
			Dispatcher.handleServerAction( actions.fetchedViewers );
			ViewersStore.getViewers( siteId );
		} );

		it( 'Should remove a single viewer.', () => {
			Dispatcher.handleServerAction( actions.removeViewer );
			viewersAgain = ViewersStore.getViewers( siteId );
			assert.lengthOf( viewersAgain, 1 );
		} );

		it( 'Should restore a single viewer on removal error.', function() {
			let viewersAfterRemove, viewersAfterError;

			Dispatcher.handleServerAction( actions.removeViewer );
			viewersAfterRemove = ViewersStore.getViewers( siteId );
			assert.lengthOf( viewersAfterRemove, 1 );

			Dispatcher.handleServerAction( actions.removeViewerError );
			viewersAfterError = ViewersStore.getViewers( siteId );
			assert.lengthOf( viewersAfterError, 2 );
		} );
	} );
} );
