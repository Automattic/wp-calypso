/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import actions from './fixtures/actions';
import site from './fixtures/site';
import userActions from 'lib/users/test/fixtures/actions';

describe( 'Viewers Store', () => {
	let Dispatcher, PeopleLogStore;

	beforeEach( () => {
		Dispatcher = require( 'dispatcher' );
		PeopleLogStore = require( '../log-store' );
		PeopleLogStore.clear();
	} );

	describe( 'Shape of store', () => {
		test( 'Store should be an object', () => {
			expect( typeof PeopleLogStore ).toBe( 'object' );
		} );

		test( 'Store should have method emitChange', () => {
			expect( typeof PeopleLogStore.emitChange ).toBe( 'function' );
		} );

		test( 'Store should have method hasUnauthorizedError', () => {
			expect( typeof PeopleLogStore.hasUnauthorizedError ).toBe( 'function' );
		} );

		test( 'Store should have method getErrors', () => {
			expect( typeof PeopleLogStore.getErrors ).toBe( 'function' );
		} );
	} );

	describe( 'hasUnauthorizedError', () => {
		test( 'Should return false when there are no errors', () => {
			expect( PeopleLogStore.hasUnauthorizedError( site.ID ) ).toBe( false );
		} );

		test( 'Should return true when there is an unauthorized error', () => {
			Dispatcher.handleServerAction( actions.unauthorizedFetchingUsers );
			expect( PeopleLogStore.hasUnauthorizedError( site.ID ) ).toBe( true );
		} );
	} );

	describe( 'Logging and retrieving errors', () => {
		test( 'getErrors should return an empty array when there are no errors', () => {
			const errors = PeopleLogStore.getErrors();
			expect( Array.isArray( errors ) ).toBe( true );
			expect( errors.length ).toBe( 0 );
		} );

		test( 'An error should increase the number of errors in the store', () => {
			let errors;
			Dispatcher.handleServerAction( actions.errorWhenFetchingUsers );
			errors = PeopleLogStore.getErrors();
			expect( Array.isArray( errors ) ).toBe( true );
			expect( errors.length ).toBe( 1 );
		} );
	} );

	describe( 'inProgress and completed actions', () => {
		test( 'getInProgress should return an empty array on init', () => {
			const inProgress = PeopleLogStore.getInProgress();
			expect( Array.isArray( inProgress ) ).toBe( true );
			expect( inProgress.length ).toBe( 0 );
		} );

		test( 'getCompleted should return an empty array on init', () => {
			const completed = PeopleLogStore.getCompleted();
			expect( Array.isArray( completed ) ).toBe( true );
			expect( completed.length ).toBe( 0 );
		} );

		test( 'An action should increase the number of inProgress in the store', () => {
			let inProgress;
			Dispatcher.handleServerAction( userActions.deleteUser );
			inProgress = PeopleLogStore.getInProgress();
			expect( Array.isArray( inProgress ) ).toBe( true );
			expect( inProgress.length ).toBe( 1 );
		} );

		test( 'An error should decrease the number of inProgress in the store', () => {
			let inProgress;
			Dispatcher.handleServerAction( userActions.deleteUser );
			inProgress = PeopleLogStore.getInProgress();
			expect( inProgress.length ).toBe( 1 );

			Dispatcher.handleServerAction( userActions.deleteUserError );
			inProgress = PeopleLogStore.getInProgress();
			expect( inProgress.length ).toBe( 0 );
		} );

		test( 'A completed action should decrease the number of inProgress in the store', () => {
			let inProgress;
			Dispatcher.handleServerAction( userActions.deleteUser );
			inProgress = PeopleLogStore.getInProgress();
			expect( inProgress.length ).toBe( 1 );

			Dispatcher.handleServerAction( userActions.deleteUserSuccess );
			inProgress = PeopleLogStore.getInProgress();
			expect( inProgress.length ).toBe( 0 );
		} );
	} );
} );
