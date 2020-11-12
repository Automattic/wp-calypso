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
import userActions from 'calypso/lib/users/test/fixtures/actions';
import Dispatcher from 'calypso/dispatcher';
import PeopleLogStore from '../log-store';

describe( 'Viewers Store', () => {
	beforeEach( () => {
		PeopleLogStore.clear();
	} );

	describe( 'Shape of store', () => {
		test( 'Store should be an object', () => {
			assert.isObject( PeopleLogStore );
		} );

		test( 'Store should have method emitChange', () => {
			assert.isFunction( PeopleLogStore.emitChange );
		} );

		test( 'Store should have method hasUnauthorizedError', () => {
			assert.isFunction( PeopleLogStore.hasUnauthorizedError );
		} );

		test( 'Store should have method getErrors', () => {
			assert.isFunction( PeopleLogStore.getErrors );
		} );
	} );

	describe( 'hasUnauthorizedError', () => {
		test( 'Should return false when there are no errors', () => {
			assert.isFalse( PeopleLogStore.hasUnauthorizedError( site.ID ) );
		} );

		test( 'Should return true when there is an unauthorized error', () => {
			Dispatcher.handleServerAction( actions.unauthorizedFetchingUsers );
			assert.isTrue( PeopleLogStore.hasUnauthorizedError( site.ID ) );
		} );
	} );

	describe( 'Logging and retrieving errors', () => {
		test( 'getErrors should return an empty array when there are no errors', () => {
			const errors = PeopleLogStore.getErrors();
			assert.isArray( errors );
			assert.lengthOf( errors, 0, 'there are no errors' );
		} );

		test( 'An error should increase the number of errors in the store', () => {
			Dispatcher.handleServerAction( actions.errorWhenFetchingUsers );
			const errors = PeopleLogStore.getErrors();
			assert.isArray( errors );
			assert.lengthOf( errors, 1, 'there is one error' );
		} );
	} );

	describe( 'inProgress and completed actions', () => {
		test( 'getInProgress should return an empty array on init', () => {
			const inProgress = PeopleLogStore.getInProgress();
			assert.isArray( inProgress );
			assert.lengthOf( inProgress, 0, 'there are no in progress actions' );
		} );

		test( 'getCompleted should return an empty array on init', () => {
			const completed = PeopleLogStore.getCompleted();
			assert.isArray( completed );
			assert.lengthOf( completed, 0, 'there are no completed actions' );
		} );

		test( 'An action should increase the number of inProgress in the store', () => {
			Dispatcher.handleServerAction( userActions.deleteUser );
			const inProgress = PeopleLogStore.getInProgress();
			assert.isArray( inProgress );
			assert.lengthOf( inProgress, 1, 'there is one in progress' );
		} );

		test( 'An error should decrease the number of inProgress in the store', () => {
			let inProgress;
			Dispatcher.handleServerAction( userActions.deleteUser );
			inProgress = PeopleLogStore.getInProgress();
			assert.lengthOf( inProgress, 1, 'there is one in progress' );

			Dispatcher.handleServerAction( userActions.deleteUserError );
			inProgress = PeopleLogStore.getInProgress();
			assert.lengthOf( inProgress, 0, 'there is none in progress' );
		} );

		test( 'A completed action should decrease the number of inProgress in the store', () => {
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
