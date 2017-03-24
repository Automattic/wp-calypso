/**
 * External dependencies
 */
import { assert } from 'chai';
import findIndex from 'lodash/findIndex';
import some from 'lodash/some';
import isUndefined from 'lodash/isUndefined';
/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import actions from './fixtures/actions';
import site from './fixtures/site';
import usersData from './fixtures/users';

describe( 'Users Store', () => {
	var Dispatcher, UsersStore, siteId, options;

	useFakeDom();

	beforeEach( () => {
		Dispatcher = require( 'dispatcher' );
		UsersStore = require( 'lib/users/store' );
		siteId = site.ID;
		options = { siteId };
	} );

	it( 'Store should be an object', () => {
		assert.isObject( UsersStore );
	} );

	it( 'Store should have method emitChange', () => {
		assert.isFunction( UsersStore.emitChange );
	} );

	describe( 'Getting user by login', () => {
		it( 'Store should have method getUserByLogin', () => {
			assert.isFunction( UsersStore.getUserByLogin );
		} );

		it( 'Should return undefined when user not in store', () => {
			assert.isUndefined( UsersStore.getUserByLogin( siteId, usersData.users[ 0 ].login ) );
		} );

		it( 'Should return a user object when the user exists', () => {
			let user;
			Dispatcher.handleServerAction( actions.fetched );
			user = UsersStore.getUserByLogin( siteId, usersData.users[ 0 ].login );

			assert.isObject( user );
			assert.equal( user.ID, usersData.users[ 0 ].ID );
		} );
	} );

	describe( 'Fetch Users', () => {
		let users;

		beforeEach( () => {
			Dispatcher.handleServerAction( actions.fetched );
			users = UsersStore.getUsers( options );
		} );

		it( 'Should update the store on RECEIVE_USERS', () => {
			assert.isNotNull( users );
		} );

		it( 'The users store should return an array of objects when fetching users', () => {
			assert.isArray( users );
			assert.isObject( users[ 0 ] );
		} );

		it( 'A user object from the store should contain an array of roles', () => {
			assert.isArray( users[ 0 ].roles );
		} );

		it( 'Re-fetching a list of users when a users was deleted from the site should result in a smaller array', () => {
			let lessUsers;
			Dispatcher.handleServerAction( actions.fetchAgainUserDeleted );
			lessUsers = UsersStore.getUsers( options );
			assert.isBelow( lessUsers.length, users.length );
		} );

		it( 'Fetching more users should add to the array of objects', () => {
			let moreUsers;
			Dispatcher.handleServerAction( actions.fetchMoreUsers );
			moreUsers = UsersStore.getUsers( options );
			assert.isAbove( moreUsers.length, users.length );
		} );
	} );

	describe( 'Pagination', () => {
		let pagination;
		beforeEach( () => {
			Dispatcher.handleServerAction( actions.fetched );
			pagination = UsersStore.getPaginationData( options );
		} );

		it( 'has the correct total users', () => {
			assert.equal( pagination.totalUsers, 7 );
		} );

		it( 'has the correct offset', () => {
			assert.equal( pagination.usersCurrentOffset, 0 );
		} );

		it( 'fetches the correct number of users', () => {
			assert.equal( pagination.numUsersFetched, 5 );
		} );

		context( 'after fetching more users', () => {
			beforeEach( () => {
				Dispatcher.handleServerAction( actions.fetchMoreUsers );
				pagination = UsersStore.getPaginationData( options );
			} );

			it( 'has the correct offset', () => {
				assert.equal( pagination.usersCurrentOffset, 5 );
			} );

			it( 'fetches the correct number of users', () => {
				assert.equal( pagination.numUsersFetched, 7 );
			} );
		} );
	} );

	describe( 'Polling updated users', () => {
		beforeEach( () => {
			Dispatcher.handleServerAction( actions.fetched );
			Dispatcher.handleServerAction( actions.fetchMoreUsers );
			Dispatcher.handleServerAction( actions.receiveUpdatedUsers );
		} );

		it( 'getUpdatedParams returns correct params', () => {
			const updatedParams = UsersStore.getUpdatedParams( options );
			assert.equal( updatedParams.offset, 0 );
			assert.equal( updatedParams.number, usersData.found )
		} );

		it( 'Polling updates expected users', () => {
			const updatedUsers = UsersStore.getUsers( options );
			assert.equal( updatedUsers.length, usersData.found );

			// The last two users should have a 'contributor' role
			updatedUsers.slice( -2, 2 ).forEach( user => {
				assert.equal( user.roles[ 0 ], 'contributor' );
			} );
		} );
	} );

	describe( 'Update a user', () => {
		beforeEach( () => {
			Dispatcher.handleServerAction( actions.fetched );
		} );

		it( 'Should update a specific user with new attributes', () => {
			const users = UsersStore.getUsers( options ),
				testUserIndex = findIndex( users, user => user.name === 'Test One' );
			let usersAgain;

			Dispatcher.handleServerAction( actions.updateSingleUser );
			usersAgain = UsersStore.getUsers( options );
			assert.equal( usersAgain[ testUserIndex ].name, 'Test Won' );
		} );

		it( 'Error should restore the updated user', () => {
			const userId = usersData.users[ 0 ].ID,
				user = UsersStore.getUser( siteId, userId );
			let userAgain, userRestored;

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
		let userId, userAgain;

		beforeEach( function() {
			Dispatcher.handleServerAction( actions.fetched );
			userId = usersData.users[ 0 ].ID;
		} );

		it( 'Should delete a specific user', () => {
			Dispatcher.handleServerAction( actions.deleteUser );
			userAgain = UsersStore.getUser( siteId, userId );
			assert.equal( userAgain, null );
		} );

		it( 'Error should restore the deleted user', () => {
			let userRestored;

			Dispatcher.handleServerAction( actions.deleteUser );
			userAgain = UsersStore.getUser( siteId, userId );
			assert.equal( userAgain, null );

			Dispatcher.handleServerAction( actions.deleteUserError );
			userRestored = UsersStore.getUser( siteId, userId );
			assert.equal( userRestored.name, 'Test One' );
		} );

		it( 'There should be no undefined objects in user array after deleting a user', () => {
			let users, someUndefined;
			Dispatcher.handleServerAction( actions.deleteUser );
			users = UsersStore.getUsers( options );
			someUndefined = some( users, isUndefined );
			assert.isFalse( someUndefined );
		} );
	} );

	describe( 'Get single user', () => {
		beforeEach( () => {
			Dispatcher.handleServerAction( actions.fetched );
		} );
		it( 'Fetching a single user should add to the store', () => {
			const users = UsersStore.getUsers( options );
			let usersAgain;
			assert.lengthOf( users, 5 );
			Dispatcher.handleServerAction( actions.receiveSingleUser );
			usersAgain = UsersStore.getUsers( options );
			assert.lengthOf( usersAgain, 6 );
		} );
	} );
} );
