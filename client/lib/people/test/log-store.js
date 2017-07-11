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
import site from './fixtures/site';
import actions from './fixtures/actions';
import userActions from 'lib/users/test/fixtures/actions';

describe( 'Viewers Store', () => {
	let Dispatcher, PeopleLogStore;

	beforeEach( () => {
		Dispatcher = require( 'dispatcher' );
		PeopleLogStore = require( '../log-store' );
		PeopleLogStore.clear();
	} );

	describe( 'Shape of store', () => {
		it( 'Store should be an object', () => {
			assert.isObject( PeopleLogStore );
		} );

		it( 'Store should have method emitChange', () => {
			assert.isFunction( PeopleLogStore.emitChange );
		} );

		it( 'Store should have method hasUnauthorizedError', () => {
			assert.isFunction( PeopleLogStore.hasUnauthorizedError );
		} );

		it( 'Store should have method getErrors', () => {
			assert.isFunction( PeopleLogStore.getErrors );
		} );
	} );

	describe( 'hasUnauthorizedError', () => {
		it( 'Should return false when there are no errors', () => {
			assert.isFalse( PeopleLogStore.hasUnauthorizedError( site.ID ) );
		} );

		it( 'Should return true when there is an unauthorized error', () => {
			Dispatcher.handleServerAction( actions.unauthorizedFetchingUsers );
			assert.isTrue( PeopleLogStore.hasUnauthorizedError( site.ID ) );
		} );
	} );

	describe( 'Logging and retrieving errors', () => {
		it( 'getErrors should return an empty array when there are no errors', () => {
			const errors = PeopleLogStore.getErrors();
			assert.isArray( errors );
			assert.lengthOf( errors, 0, 'there are no errors' );
		} );

		it( 'An error should increase the number of errors in the store', () => {
			let errors;
			Dispatcher.handleServerAction( actions.errorWhenFetchingUsers );
			errors = PeopleLogStore.getErrors();
			assert.isArray( errors );
			assert.lengthOf( errors, 1, 'there is one error' );
		} );
	} );

	describe( 'inProgress and completed actions', () => {
		it( 'getInProgress should return an empty array on init', () => {
			const inProgress = PeopleLogStore.getInProgress();
			assert.isArray( inProgress );
			assert.lengthOf( inProgress, 0, 'there are no in progress actions' );
		} );

		it( 'getCompleted should return an empty array on init', () => {
			const completed = PeopleLogStore.getCompleted();
			assert.isArray( completed );
			assert.lengthOf( completed, 0, 'there are no completed actions' );
		} );

		it( 'An action should increase the number of inProgress in the store', () => {
			let inProgress;
			Dispatcher.handleServerAction( userActions.deleteUser );
			inProgress = PeopleLogStore.getInProgress();
			assert.isArray( inProgress );
			assert.lengthOf( inProgress, 1, 'there is one in progress' );
		} );

		it( 'An error should decrease the number of inProgress in the store', () => {
			let inProgress;
			Dispatcher.handleServerAction( userActions.deleteUser );
			inProgress = PeopleLogStore.getInProgress();
			assert.lengthOf( inProgress, 1, 'there is one in progress' );

			Dispatcher.handleServerAction( userActions.deleteUserError );
			inProgress = PeopleLogStore.getInProgress();
			assert.lengthOf( inProgress, 0, 'there is none in progress' );
		} );

		it( 'A completed action should decrease the number of inProgress in the store', () => {
			let inProgress;
			Dispatcher.handleServerAction( userActions.deleteUser );
			inProgress = PeopleLogStore.getInProgress();
			assert.lengthOf( inProgress, 1, 'there is one in progress' );

			Dispatcher.handleServerAction( userActions.deleteUserSuccess );
			inProgress = PeopleLogStore.getInProgress();
			assert.lengthOf( inProgress, 0, 'there is none in progress' );
		} );
	} );
} );
