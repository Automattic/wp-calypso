/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import actions from './fixtures/actions';
import site from './fixtures/site';

describe( 'Viewers Store', () => {
	const siteId = site.ID;
	let Dispatcher, ViewersStore;

	beforeEach( () => {
		Dispatcher = require( 'dispatcher' );
		ViewersStore = require( '../store' );
	} );

	describe( 'Shape of store', () => {
		test( 'Store should be an object', () => {
			expect( typeof ViewersStore ).toBe( 'object' );
		} );

		test( 'Store should have method emitChange', () => {
			expect( typeof ViewersStore.emitChange ).toBe( 'function' );
		} );

		test( 'Store should have method getViewers', () => {
			expect( typeof ViewersStore.getViewers ).toBe( 'function' );
		} );

		test( 'Store should have method getPaginationData', () => {
			expect( typeof ViewersStore.getPaginationData ).toBe( 'function' );
		} );
	} );

	describe( 'Get Viewers', () => {
		test( "Should return false when viewers haven't been fetched", () => {
			const viewers = ViewersStore.getViewers( siteId );

			expect( viewers ).toBe( false );
		} );

		test( 'Should return an array of objects when there are viewers', () => {
			let viewers;

			Dispatcher.handleServerAction( actions.fetchedViewers );
			viewers = ViewersStore.getViewers( siteId );

			expect( Array.isArray( viewers ) ).toBe( true );
			expect( typeof viewers[ 0 ] ).toBe( 'object' );
		} );
	} );

	describe( 'Fetch Viewers', () => {
		let viewers, viewersAgain;
		beforeEach( () => {
			Dispatcher.handleServerAction( actions.fetchedViewers );
			viewers = ViewersStore.getViewers( siteId );
		} );

		test( 'Fetching zero users should not affect store size', () => {
			Dispatcher.handleServerAction( actions.fetchedViewersEmpty );
			viewersAgain = ViewersStore.getViewers( siteId );
			expect( viewers.length ).toEqual( viewersAgain.length );
		} );

		test( 'Fetching more viewers should increase the store size', () => {
			Dispatcher.handleServerAction( actions.fetchedMoreViewers );
			viewersAgain = ViewersStore.getViewers( siteId );
			expect( viewersAgain.length ).not.toEqual( viewers.length );
		} );
	} );

	describe( 'Pagination', () => {
		let pagination;
		beforeEach( () => {
			Dispatcher.handleServerAction( actions.fetchedViewers );
			pagination = ViewersStore.getPaginationData( siteId );
		} );

		test( 'has the correct total viewers', () => {
			expect( pagination.totalViewers ).toEqual( 4 );
		} );

		test( 'has the correct number of viewers fetched', () => {
			expect( pagination.numViewersFetched ).toEqual( 2 );
		} );

		test( 'has the correct page', () => {
			expect( pagination.currentViewersPage ).toEqual( 1 );
		} );

		describe( 'after fetching more viewers', () => {
			beforeEach( () => {
				Dispatcher.handleServerAction( actions.fetchedMoreViewers );
				pagination = ViewersStore.getPaginationData( siteId );
			} );

			test( 'has the correct updated number of viewers fetched', () => {
				expect( pagination.numViewersFetched ).toEqual( 4 );
			} );

			test( 'advances to the next page', () => {
				expect( pagination.currentViewersPage ).toEqual( 2 );
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
			expect( viewersAgain.length ).toBe( 1 );
		} );

		test( 'Should restore a single viewer on removal error.', () => {
			let viewersAfterRemove, viewersAfterError;

			Dispatcher.handleServerAction( actions.removeViewer );
			viewersAfterRemove = ViewersStore.getViewers( siteId );
			expect( viewersAfterRemove.length ).toBe( 1 );

			Dispatcher.handleServerAction( actions.removeViewerError );
			viewersAfterError = ViewersStore.getViewers( siteId );
			expect( viewersAfterError.length ).toBe( 2 );
		} );
	} );
} );
