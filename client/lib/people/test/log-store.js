/**
 * External dependencies
 */
var assert = require( 'chai' ).assert;

var site = require( './lib/mock-site' ),
	actions = require( './lib/mock-actions' ),
	userActions = require( 'lib/users/test/lib/mock-actions' );

require( 'lib/react-test-env-setup' )();

describe( 'Viewers Store', function() {
	var Dispatcher, PeopleLogStore;

	beforeEach( function() {
		Dispatcher = require( 'dispatcher' );
		PeopleLogStore = require( '../log-store' );
		PeopleLogStore.clear();
	} );

	describe( 'Shape of store', function() {
		it( 'Store should be an object', function() {
			assert.isObject( PeopleLogStore );
		} );

		it( 'Store should have method emitChange', function() {
			assert.isFunction( PeopleLogStore.emitChange );
		} );

		it( 'Store should have method hasUnauthorizedError', function() {
			assert.isFunction( PeopleLogStore.hasUnauthorizedError );
		} );

		it( 'Store should have method getErrors', function() {
			assert.isFunction( PeopleLogStore.getErrors );
		} );
	} );

	describe( 'hasUnauthorizedError', function() {
		it( 'Should return false when there are no errors', function() {
			assert.isFalse( PeopleLogStore.hasUnauthorizedError( site.ID ) );
		} );

		it( 'Should return true when there is an unauthorized error', function() {
			Dispatcher.handleServerAction( actions.unauthorizedFetchingUsers );
			assert.isTrue( PeopleLogStore.hasUnauthorizedError( site.ID ) );
		} );
	} );

	describe( 'Logging and retrieving errors', function() {
		it( 'getErrors should return an empty array when there are no errors', function() {
			var errors = PeopleLogStore.getErrors();
			assert.isArray( errors );
			assert.lengthOf( errors, 0, 'there are no errors' );
		} );

		it( 'An error should increase the number of errors in the store', function() {
			var errors;
			Dispatcher.handleServerAction( actions.errorWhenFetchingUsers );
			errors = PeopleLogStore.getErrors();
			assert.isArray( errors );
			assert.lengthOf( errors, 1, 'there is one error' );
		} );
	} );

	describe( 'inProgress and completed actions', function() {
		it( 'getInProgress should return an empty array on init', function() {
			var inProgress = PeopleLogStore.getInProgress();
			assert.isArray( inProgress );
			assert.lengthOf( inProgress, 0, 'there are no in progress actions' );
		} );

		it( 'getCompleted should return an empty array on init', function() {
			var completed = PeopleLogStore.getCompleted();
			assert.isArray( completed );
			assert.lengthOf( completed, 0, 'there are no completed actions' );
		} );

		it( 'An action should increase the number of inProgress in the store', function() {
			var inProgress;
			Dispatcher.handleServerAction( userActions.deleteUser );
			inProgress = PeopleLogStore.getInProgress();
			assert.isArray( inProgress );
			assert.lengthOf( inProgress, 1, 'there is one in progress' );
		} );
		it( 'An error should decrease the number of inProgress in the store', function() {
			var inProgress;
			Dispatcher.handleServerAction( userActions.deleteUser );
			inProgress = PeopleLogStore.getInProgress();
			assert.lengthOf( inProgress, 1, 'there is one in progress' );

			Dispatcher.handleServerAction( userActions.deleteUserError );
			inProgress = PeopleLogStore.getInProgress();
			assert.lengthOf( inProgress, 0, 'there is none in progress' );
		} );
		it( 'A completed action should decrease the number of inProgress in the store', function() {
			var inProgress;
			Dispatcher.handleServerAction( userActions.deleteUser );
			inProgress = PeopleLogStore.getInProgress();
			assert.lengthOf( inProgress, 1, 'there is one in progress' );

			Dispatcher.handleServerAction( userActions.deleteUserSuccess );
			inProgress = PeopleLogStore.getInProgress();
			assert.lengthOf( inProgress, 0, 'there is none in progress' );
		} );

	} );
} );
