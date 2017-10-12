/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { findIndex, isUndefined, some } from 'lodash';

/**
 * Internal dependencies
 */
import actions from './fixtures/actions';
import site from './fixtures/site';
import usersData from './fixtures/users';

describe( 'Users Store', () => {
	var Dispatcher, UsersStore, siteId, options;

	beforeEach( () => {
		Dispatcher = require( 'dispatcher' );
		UsersStore = require( 'lib/users/store' );
		siteId = site.ID;
		options = { siteId };
	} );

	test( 'Store should be an object', () => {
		expect( typeof UsersStore ).toBe( 'object' );
	} );

	test( 'Store should have method emitChange', () => {
		expect( typeof UsersStore.emitChange ).toBe( 'function' );
	} );

	describe( 'Getting user by login', () => {
		test( 'Store should have method getUserByLogin', () => {
			expect( typeof UsersStore.getUserByLogin ).toBe( 'function' );
		} );

		test( 'Should return undefined when user not in store', () => {
			expect( UsersStore.getUserByLogin( siteId, usersData.users[ 0 ].login ) ).not.toBeDefined();
		} );

		test( 'Should return a user object when the user exists', () => {
			let user;
			Dispatcher.handleServerAction( actions.fetched );
			user = UsersStore.getUserByLogin( siteId, usersData.users[ 0 ].login );

			expect( typeof user ).toBe( 'object' );
			expect( user.ID ).toEqual( usersData.users[ 0 ].ID );
		} );
	} );

	describe( 'Fetch Users', () => {
		let users;

		beforeEach( () => {
			Dispatcher.handleServerAction( actions.fetched );
			users = UsersStore.getUsers( options );
		} );

		test( 'Should update the store on RECEIVE_USERS', () => {
			expect( users ).not.toBeNull();
		} );

		test( 'The users store should return an array of objects when fetching users', () => {
			expect( Array.isArray( users ) ).toBe( true );
			expect( typeof users[ 0 ] ).toBe( 'object' );
		} );

		test( 'A user object from the store should contain an array of roles', () => {
			expect( Array.isArray( users[ 0 ].roles ) ).toBe( true );
		} );

		test( 'Re-fetching a list of users when a users was deleted from the site should result in a smaller array', () => {
			let lessUsers;
			Dispatcher.handleServerAction( actions.fetchAgainUserDeleted );
			lessUsers = UsersStore.getUsers( options );
			expect( lessUsers.length ).toBeLessThan( users.length );
		} );

		test( 'Fetching more users should add to the array of objects', () => {
			let moreUsers;
			Dispatcher.handleServerAction( actions.fetchMoreUsers );
			moreUsers = UsersStore.getUsers( options );
			expect( moreUsers.length ).toBeGreaterThan( users.length );
		} );
	} );

	describe( 'Pagination', () => {
		let pagination;
		beforeEach( () => {
			Dispatcher.handleServerAction( actions.fetched );
			pagination = UsersStore.getPaginationData( options );
		} );

		test( 'has the correct total users', () => {
			expect( pagination.totalUsers ).toEqual( 7 );
		} );

		test( 'has the correct offset', () => {
			expect( pagination.usersCurrentOffset ).toEqual( 0 );
		} );

		test( 'fetches the correct number of users', () => {
			expect( pagination.numUsersFetched ).toEqual( 5 );
		} );

		describe( 'after fetching more users', () => {
			beforeEach( () => {
				Dispatcher.handleServerAction( actions.fetchMoreUsers );
				pagination = UsersStore.getPaginationData( options );
			} );

			test( 'has the correct offset', () => {
				expect( pagination.usersCurrentOffset ).toEqual( 5 );
			} );

			test( 'fetches the correct number of users', () => {
				expect( pagination.numUsersFetched ).toEqual( 7 );
			} );
		} );
	} );

	describe( 'Polling updated users', () => {
		beforeEach( () => {
			Dispatcher.handleServerAction( actions.fetched );
			Dispatcher.handleServerAction( actions.fetchMoreUsers );
			Dispatcher.handleServerAction( actions.receiveUpdatedUsers );
		} );

		test( 'getUpdatedParams returns correct params', () => {
			const updatedParams = UsersStore.getUpdatedParams( options );
			expect( updatedParams.offset ).toEqual( 0 );
			expect( updatedParams.number ).toEqual( usersData.found );
		} );

		test( 'Polling updates expected users', () => {
			const updatedUsers = UsersStore.getUsers( options );
			expect( updatedUsers.length ).toEqual( usersData.found );

			// The last two users should have a 'contributor' role
			updatedUsers.slice( -2, 2 ).forEach( user => {
				expect( user.roles[ 0 ] ).toEqual( 'contributor' );
			} );
		} );
	} );

	describe( 'Update a user', () => {
		beforeEach( () => {
			Dispatcher.handleServerAction( actions.fetched );
		} );

		test( 'Should update a specific user with new attributes', () => {
			const users = UsersStore.getUsers( options ),
				testUserIndex = findIndex( users, user => user.name === 'Test One' );
			let usersAgain;

			Dispatcher.handleServerAction( actions.updateSingleUser );
			usersAgain = UsersStore.getUsers( options );
			expect( usersAgain[ testUserIndex ].name ).toEqual( 'Test Won' );
		} );

		test( 'Error should restore the updated user', () => {
			const userId = usersData.users[ 0 ].ID,
				user = UsersStore.getUser( siteId, userId );
			let userAgain, userRestored;

			expect( user.name ).toEqual( 'Test One' );

			Dispatcher.handleServerAction( actions.updateSingleUser );
			userAgain = UsersStore.getUser( siteId, userId );
			expect( userAgain.name ).toEqual( 'Test Won' );

			Dispatcher.handleServerAction( actions.updateUserError );
			userRestored = UsersStore.getUser( siteId, userId );
			expect( userRestored.name ).toEqual( 'Test One' );
		} );
	} );

	describe( 'Delete a user', () => {
		let userId, userAgain;

		beforeEach( () => {
			Dispatcher.handleServerAction( actions.fetched );
			userId = usersData.users[ 0 ].ID;
		} );

		test( 'Should delete a specific user', () => {
			Dispatcher.handleServerAction( actions.deleteUser );
			userAgain = UsersStore.getUser( siteId, userId );
			expect( userAgain ).toEqual( null );
		} );

		test( 'Error should restore the deleted user', () => {
			let userRestored;

			Dispatcher.handleServerAction( actions.deleteUser );
			userAgain = UsersStore.getUser( siteId, userId );
			expect( userAgain ).toEqual( null );

			Dispatcher.handleServerAction( actions.deleteUserError );
			userRestored = UsersStore.getUser( siteId, userId );
			expect( userRestored.name ).toEqual( 'Test One' );
		} );

		test( 'There should be no undefined objects in user array after deleting a user', () => {
			let users, someUndefined;
			Dispatcher.handleServerAction( actions.deleteUser );
			users = UsersStore.getUsers( options );
			someUndefined = some( users, isUndefined );
			expect( someUndefined ).toBe( false );
		} );
	} );

	describe( 'Get single user', () => {
		beforeEach( () => {
			Dispatcher.handleServerAction( actions.fetched );
		} );
		test( 'Fetching a single user should add to the store', () => {
			const users = UsersStore.getUsers( options );
			let usersAgain;
			expect( users.length ).toBe( 5 );
			Dispatcher.handleServerAction( actions.receiveSingleUser );
			usersAgain = UsersStore.getUsers( options );
			expect( usersAgain.length ).toBe( 6 );
		} );
	} );
} );
