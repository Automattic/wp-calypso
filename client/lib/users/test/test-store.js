require( 'lib/react-test-env-setup' )();

/**
 * External dependencies
 */
const assert = require( 'chai' ).assert;

/**
 * Internal dependencies
 */
const actions = require( './lib/mock-actions' ),
	site = require( './lib/mock-site' ),
	usersData = require( './lib/mock-users-data' );

/**
 * Module variables
 */
const siteId = site.ID,
	options = {
		siteId: siteId
	};

describe( 'Users Store', function() {
	var Dispatcher, UsersStore;

	beforeEach( function() {
		Dispatcher = require( 'dispatcher' );
		UsersStore = require( 'lib/users/store' );
	} );

	it( 'Store should be an object', function() {
		assert.isObject( UsersStore );
	} );

	it( 'Store should have method emitChange', function() {
		assert.isFunction( UsersStore.emitChange );
	} );

	describe( 'Getting user by login', function() {
		it( 'Store should have method getUserByLogin', function() {
			assert.isFunction( UsersStore.getUserByLogin );
		} );

		it( 'Should return undefined when user not in store', function() {
			assert.isUndefined( UsersStore.getUserByLogin( siteId, usersData.users[0].login ) );
		} );

		it( 'Should return a user object when the user exists', function() {
			var user;
			Dispatcher.handleServerAction( actions.fetched );
			user = UsersStore.getUserByLogin( siteId, usersData.users[0].login );

			assert.isObject( user );
			assert.equal( user.ID, usersData.users[0].ID );
		} );
	} );

	describe( 'Fetch Users', function() {
		beforeEach( function() {
			Dispatcher.handleServerAction( actions.fetched );
		} );

		it( 'Should update the store on RECEIVE_USERS', function() {
			assert.isNotNull( UsersStore.getUsers( options ) );
		} );

		it( 'The users store should return an array of objects when fetching users', function() {
			var users = UsersStore.getUsers( options );
			assert.isArray( users );
			assert.isObject( users[0] );
		} );

		it( 'A user object from the store should contain an array of roles', function() {
			var users = UsersStore.getUsers( options ),
				user = users[0];
			assert.isArray( user.roles );
		} );

		it( 'Re-fetching a list of users when a users was deleted from the site should result in a smaller array', function() {
			var users = UsersStore.getUsers( options ),
				usersAgain;
			assert.equal( users.length, 5 );
			Dispatcher.handleServerAction( actions.fetchAgainUserDeleted );
			usersAgain = UsersStore.getUsers( options );
			assert.equal( usersAgain.length, 4 );
		} );

		it( 'Fetching more users should add to the array of objects', function() {
			var users = UsersStore.getUsers( options ),
				moreUsers;
			assert.equal( users.length, 5 );
			Dispatcher.handleServerAction( actions.fetchMoreUsers );
			moreUsers = UsersStore.getUsers( options );
			assert.equal( moreUsers.length, 7 );
		} );

		it( 'Pagination data should update when we fetch more users', function() {
			var pagination = UsersStore.getPaginationData( options );
			assert.equal( pagination.totalUsers, 7 );
			assert.equal( pagination.usersCurrentOffset, 0 );
			assert.equal( pagination.numUsersFetched, 5 );
			Dispatcher.handleServerAction( actions.fetchMoreUsers );
			pagination = UsersStore.getPaginationData( options );
			assert.equal( pagination.usersCurrentOffset, 5 );
			assert.equal( pagination.numUsersFetched, 7 );
		} );
	} );

	describe( 'Update a user', function() {
		beforeEach( function() {
			Dispatcher.handleServerAction( actions.fetched );
		} );
		it( 'Should update a specific user with new attributes', function() {
			var users = UsersStore.getUsers( options ),
				usersAgain, testUserIndex;

			users.forEach( function( user, i ) {
				if ( user.name !== 'Test One' ) {
					return;
				}
				testUserIndex = i;
			} );
			Dispatcher.handleServerAction( actions.updateSingleUser );
			usersAgain = UsersStore.getUsers( options );
			assert.equal( usersAgain[ testUserIndex ].name, 'Test Won' );
		} );
		it( 'Error should restore the updated user', function() {
			var userId = usersData.users[0].ID,
				user, userAgain, userRestored;
			user = UsersStore.getUser( siteId, userId );
			assert.equal( user.name, 'Test One' );

			Dispatcher.handleServerAction( actions.updateSingleUser );
			userAgain = UsersStore.getUser( siteId, userId );
			assert.equal( userAgain.name, 'Test Won' );

			Dispatcher.handleServerAction( actions.updateUserError );
			userRestored = UsersStore.getUser( siteId, userId );
			assert.equal( userRestored.name, 'Test One' );
		} );
	} );

	describe( 'Delete a user', function() {
		beforeEach( function() {
			Dispatcher.handleServerAction( actions.fetched );
		} );
		it( 'Should delete a specific user', function() {
			var userId = usersData.users[0].ID,
				user, userAgain;
			user = UsersStore.getUser( siteId, userId );
			assert.equal( user.name, 'Test One' );

			Dispatcher.handleServerAction( actions.deleteUser );
			userAgain = UsersStore.getUser( siteId, userId );
			assert.equal( userAgain, null );
		} );
		it( 'Error should restore the deleted user', function() {
			var userId = usersData.users[0].ID,
				user, userAgain, userRestored;
			user = UsersStore.getUser( siteId, userId );
			assert.equal( user.name, 'Test One' );

			Dispatcher.handleServerAction( actions.deleteUser );
			userAgain = UsersStore.getUser( siteId, userId );
			assert.equal( userAgain, null );

			Dispatcher.handleServerAction( actions.deleteUserError );
			userRestored = UsersStore.getUser( siteId, userId );
			assert.equal( userRestored.name, 'Test One' );
		} );
		it( 'There should be no undefined objects in user array after deleting a user', function() {
			var userId = usersData.users[0].ID,
				user, users;
			user = UsersStore.getUser( siteId, userId );
			assert.equal( user.name, 'Test One' );

			Dispatcher.handleServerAction( actions.deleteUser );
			users = UsersStore.getUsers( options );
			users.forEach( _user => {
				assert.notEqual( undefined, _user );
			} );
		} );
	} );

	describe( 'Get single user', function() {
		beforeEach( function() {
			Dispatcher.handleServerAction( actions.fetched );
		} );
		it( 'Fetching a single user should add to the store', function() {
			var users = UsersStore.getUsers( options ),
				usersAgain;
			assert.equal( 5, users.length );
			Dispatcher.handleServerAction( actions.receiveSingleUser );
			usersAgain = UsersStore.getUsers( options );
			assert.equal( 6, usersAgain.length );
		} );
	} );
} );
