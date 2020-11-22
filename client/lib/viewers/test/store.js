/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import actions from './fixtures/actions';
import site from './fixtures/site';
import Dispatcher from 'calypso/dispatcher';
import ViewersStore from '../store';

describe( 'Viewers Store', () => {
	const siteId = site.ID;

	describe( 'Shape of store', () => {
		test( 'Store should be an object', () => {
			assert.isObject( ViewersStore );
		} );

		test( 'Store should have method emitChange', () => {
			assert.isFunction( ViewersStore.emitChange );
		} );

		test( 'Store should have method getViewers', () => {
			assert.isFunction( ViewersStore.getViewers );
		} );

		test( 'Store should have method getPaginationData', () => {
			assert.isFunction( ViewersStore.getPaginationData );
		} );
	} );

	describe( 'Get Viewers', () => {
		test( "Should return false when viewers haven't been fetched", () => {
			const viewers = ViewersStore.getViewers( siteId );

			assert.isFalse( viewers, 'viewers is false' );
		} );

		test( 'Should return an array of objects when there are viewers', () => {
			Dispatcher.handleServerAction( actions.fetchedViewers );
			const viewers = ViewersStore.getViewers( siteId );

			assert.isArray( viewers, 'viewers is an array' );
			assert.isObject( viewers[ 0 ] );
		} );
	} );

	describe( 'Fetch Viewers', () => {
		let viewers;
		let viewersAgain;
		beforeEach( () => {
			Dispatcher.handleServerAction( actions.fetchedViewers );
			viewers = ViewersStore.getViewers( siteId );
		} );

		test( 'Fetching zero users should not affect store size', () => {
			Dispatcher.handleServerAction( actions.fetchedViewersEmpty );
			viewersAgain = ViewersStore.getViewers( siteId );
			assert.equal( viewers.length, viewersAgain.length, 'the viewers store was not affected' );
		} );

		test( 'Fetching more viewers should increase the store size', () => {
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

		test( 'has the correct total viewers', () => {
			assert.equal( pagination.totalViewers, 4 );
		} );

		test( 'has the correct number of viewers fetched', () => {
			assert.equal( pagination.numViewersFetched, 2 );
		} );

		test( 'has the correct page', () => {
			assert.equal( pagination.currentViewersPage, 1 );
		} );

		describe( 'after fetching more viewers', () => {
			beforeEach( () => {
				Dispatcher.handleServerAction( actions.fetchedMoreViewers );
				pagination = ViewersStore.getPaginationData( siteId );
			} );

			test( 'has the correct updated number of viewers fetched', () => {
				assert.equal( pagination.numViewersFetched, 4 );
			} );

			test( 'advances to the next page', () => {
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

		test( 'Should remove a single viewer.', () => {
			Dispatcher.handleServerAction( actions.removeViewer );
			viewersAgain = ViewersStore.getViewers( siteId );
			assert.lengthOf( viewersAgain, 1 );
		} );

		test( 'Should restore a single viewer on removal error.', () => {
			Dispatcher.handleServerAction( actions.removeViewer );
			const viewersAfterRemove = ViewersStore.getViewers( siteId );
			assert.lengthOf( viewersAfterRemove, 1 );

			Dispatcher.handleServerAction( actions.removeViewerError );
			const viewersAfterError = ViewersStore.getViewers( siteId );
			assert.lengthOf( viewersAfterError, 2 );
		} );
	} );
} );
