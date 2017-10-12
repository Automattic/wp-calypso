/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import actions from './lib/mock-actions';
import site from './lib/mock-site';

/**
 * Internal dependencies
 */
const options = { siteId: site.ID };

describe( 'Email Followers Store', () => {
	var Dispatcher, EmailFollowersStore;

	beforeEach( () => {
		Dispatcher = require( 'dispatcher' );
		EmailFollowersStore = require( 'lib/email-followers/store' );
	} );

	test( 'Store should be an object', () => {
		expect( typeof EmailFollowersStore ).toBe( 'object' );
	} );

	describe( 'Fetch Email Followers', () => {
		beforeEach( () => {
			Dispatcher.handleServerAction( actions.fetchedFollowers );
		} );

		test( 'Should update the store on RECEIVE_EMAIL_FOLLOWERS', () => {
			var followers = EmailFollowersStore.getFollowers( options );
			expect( 2 ).toEqual( followers.length );
		} );

		test( 'The store should return an array of objects when fetching email followers', () => {
			var followers = EmailFollowersStore.getFollowers( options );
			expect( Array.isArray( followers ) ).toBe( true );
			expect( typeof followers[ 0 ] ).toBe( 'object' );
		} );

		test( 'Fetching more email followers should update the array in the store', () => {
			var followers = EmailFollowersStore.getFollowers( options ),
				followersAgain;
			expect( followers.length ).toEqual( 2 );
			Dispatcher.handleServerAction( actions.fetchedMoreFollowers );
			followersAgain = EmailFollowersStore.getFollowers( options );
			expect( followersAgain.length ).toEqual( 4 );
		} );

		test( 'Pagination data should update when we fetch more email followers', () => {
			var pagination = EmailFollowersStore.getPaginationData( options );
			expect( pagination.totalFollowers ).toEqual( 4 );
			expect( pagination.numFollowersFetched ).toEqual( 2 );
			expect( pagination.followersCurrentPage ).toEqual( 1 );
			Dispatcher.handleServerAction( actions.fetchedMoreFollowers );
			pagination = EmailFollowersStore.getPaginationData( options );
			expect( pagination.numFollowersFetched ).toEqual( 4 );
			expect( pagination.followersCurrentPage ).toEqual( 2 );
		} );
	} );

	describe( 'Remove follower', () => {
		beforeEach( () => {
			Dispatcher.handleServerAction( actions.fetchedFollowers );
		} );
		test( 'Should remove a single follower.', () => {
			var followers = EmailFollowersStore.getFollowers( options ),
				followersAgain;

			expect( followers.length ).toEqual( 2 );
			Dispatcher.handleServerAction( actions.removeFollower );
			Dispatcher.handleServerAction( actions.removeFollowerSuccess );
			followersAgain = EmailFollowersStore.getFollowers( options );
			expect( followersAgain.length ).toEqual( 1 );
		} );
		test( 'Should restore a single follower on removal error.', () => {
			var followers = EmailFollowersStore.getFollowers( options ),
				followersAfterRemove,
				followersAfterError;
			expect( followers.length ).toEqual( 2 );
			Dispatcher.handleServerAction( actions.removeFollower );
			followersAfterRemove = EmailFollowersStore.getFollowers( options );
			expect( followersAfterRemove.length ).toEqual( 1 );
			Dispatcher.handleServerAction( actions.removeFollowerError );
			followersAfterError = EmailFollowersStore.getFollowers( options );
			expect( followersAfterError.length ).toEqual( 2 );
		} );
	} );
} );
