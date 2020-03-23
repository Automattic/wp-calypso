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
import actions from './lib/mock-actions';
import site from './lib/mock-site';

/**
 * Internal dependencies
 */
const options = { siteId: site.ID };

describe( 'WPCOM Followers Store', () => {
	let Dispatcher, FollowersStore;

	beforeEach( () => {
		Dispatcher = require( 'dispatcher' );
		FollowersStore = require( 'lib/followers/store' );
	} );

	test( 'Store should be an object', () => {
		assert.isObject( FollowersStore );
	} );

	describe( 'Fetch Followers', () => {
		beforeEach( () => {
			Dispatcher.handleServerAction( actions.fetchedFollowers );
		} );

		test( 'Should update the store on RECEIVE_FOLLOWERS', () => {
			const followers = FollowersStore.getFollowers( options );
			assert.equal( 2, followers.length );
		} );

		test( 'The store should return an array of objects when fetching followers', () => {
			const followers = FollowersStore.getFollowers( options );
			assert.isArray( followers );
			assert.isObject( followers[ 0 ] );
		} );

		test( 'Fetching more followers should update the array in the store', () => {
			let followers = FollowersStore.getFollowers( options ),
				followersAgain;
			assert.equal( followers.length, 2 );
			Dispatcher.handleServerAction( actions.fetchedMoreFollowers );
			followersAgain = FollowersStore.getFollowers( options );
			assert.equal( followersAgain.length, 4 );
		} );

		test( 'Pagination data should update when we fetch more followers', () => {
			let pagination = FollowersStore.getPaginationData( options );
			assert.equal( pagination.totalFollowers, 4 );
			assert.equal( pagination.numFollowersFetched, 2 );
			assert.equal( pagination.followersCurrentPage, 1 );
			Dispatcher.handleServerAction( actions.fetchedMoreFollowers );
			pagination = FollowersStore.getPaginationData( options );
			assert.equal( pagination.numFollowersFetched, 4 );
			assert.equal( pagination.followersCurrentPage, 2 );
		} );
	} );

	describe( 'Remove follower', () => {
		beforeEach( () => {
			Dispatcher.handleServerAction( actions.fetchedFollowers );
		} );
		test( 'Should remove a single follower.', () => {
			let followers = FollowersStore.getFollowers( options ),
				followersAgain;

			assert.equal( followers.length, 2 );
			Dispatcher.handleServerAction( actions.removeFollower );
			Dispatcher.handleServerAction( actions.removeFollowerSuccess );
			followersAgain = FollowersStore.getFollowers( options );
			assert.equal( followersAgain.length, 1 );
		} );
		test( 'Should restore a single follower on removal error.', () => {
			let followers = FollowersStore.getFollowers( options ),
				followersAfterRemove,
				followersAfterError;
			assert.equal( followers.length, 2 );
			Dispatcher.handleServerAction( actions.removeFollower );
			followersAfterRemove = FollowersStore.getFollowers( options );
			assert.equal( followersAfterRemove.length, 1 );
			Dispatcher.handleServerAction( actions.removeFollowerError );
			followersAfterError = FollowersStore.getFollowers( options );
			assert.equal( followersAfterError.length, 2 );
		} );
	} );
} );
