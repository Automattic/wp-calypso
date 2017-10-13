/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
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
		assert.isObject( EmailFollowersStore );
	} );

	describe( 'Fetch Email Followers', () => {
		beforeEach( () => {
			Dispatcher.handleServerAction( actions.fetchedFollowers );
		} );

		test( 'Should update the store on RECEIVE_EMAIL_FOLLOWERS', () => {
			var followers = EmailFollowersStore.getFollowers( options );
			assert.equal( 2, followers.length );
		} );

		test( 'The store should return an array of objects when fetching email followers', () => {
			var followers = EmailFollowersStore.getFollowers( options );
			assert.isArray( followers );
			assert.isObject( followers[ 0 ] );
		} );

		test( 'Fetching more email followers should update the array in the store', () => {
			var followers = EmailFollowersStore.getFollowers( options ),
				followersAgain;
			assert.equal( followers.length, 2 );
			Dispatcher.handleServerAction( actions.fetchedMoreFollowers );
			followersAgain = EmailFollowersStore.getFollowers( options );
			assert.equal( followersAgain.length, 4 );
		} );

		test( 'Pagination data should update when we fetch more email followers', () => {
			var pagination = EmailFollowersStore.getPaginationData( options );
			assert.equal( pagination.totalFollowers, 4 );
			assert.equal( pagination.numFollowersFetched, 2 );
			assert.equal( pagination.followersCurrentPage, 1 );
			Dispatcher.handleServerAction( actions.fetchedMoreFollowers );
			pagination = EmailFollowersStore.getPaginationData( options );
			assert.equal( pagination.numFollowersFetched, 4 );
			assert.equal( pagination.followersCurrentPage, 2 );
		} );
	} );

	describe( 'Remove follower', () => {
		beforeEach( () => {
			Dispatcher.handleServerAction( actions.fetchedFollowers );
		} );
		test( 'Should remove a single follower.', () => {
			var followers = EmailFollowersStore.getFollowers( options ),
				followersAgain;

			assert.equal( followers.length, 2 );
			Dispatcher.handleServerAction( actions.removeFollower );
			Dispatcher.handleServerAction( actions.removeFollowerSuccess );
			followersAgain = EmailFollowersStore.getFollowers( options );
			assert.equal( followersAgain.length, 1 );
		} );
		test( 'Should restore a single follower on removal error.', () => {
			var followers = EmailFollowersStore.getFollowers( options ),
				followersAfterRemove,
				followersAfterError;
			assert.equal( followers.length, 2 );
			Dispatcher.handleServerAction( actions.removeFollower );
			followersAfterRemove = EmailFollowersStore.getFollowers( options );
			assert.equal( followersAfterRemove.length, 1 );
			Dispatcher.handleServerAction( actions.removeFollowerError );
			followersAfterError = EmailFollowersStore.getFollowers( options );
			assert.equal( followersAfterError.length, 2 );
		} );
	} );
} );
