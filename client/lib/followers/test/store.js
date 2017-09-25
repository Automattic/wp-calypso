/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import actions from './lib/mock-actions';

import site from './lib/mock-site';
import useFakeDom from 'test/helpers/use-fake-dom';

/**
 * Internal dependencies
 */
const options = { siteId: site.ID };

describe( 'WPCOM Followers Store', function() {
	let Dispatcher, FollowersStore;

	useFakeDom();

	beforeEach( function() {
		Dispatcher = require( 'dispatcher' );
		FollowersStore = require( 'lib/followers/store' );
	} );

	it( 'Store should be an object', function() {
		assert.isObject( FollowersStore );
	} );

	describe( 'Fetch Followers', function() {
		beforeEach( function() {
			Dispatcher.handleServerAction( actions.fetchedFollowers );
		} );

		it( 'Should update the store on RECEIVE_FOLLOWERS', function() {
			const followers = FollowersStore.getFollowers( options );
			assert.equal( 2, followers.length );
		} );

		it( 'The store should return an array of objects when fetching followers', function() {
			const followers = FollowersStore.getFollowers( options );
			assert.isArray( followers );
			assert.isObject( followers[ 0 ] );
		} );

		it( 'Fetching more followers should update the array in the store', function() {
			let followers = FollowersStore.getFollowers( options ),
				followersAgain;
			assert.equal( followers.length, 2 );
			Dispatcher.handleServerAction( actions.fetchedMoreFollowers );
			followersAgain = FollowersStore.getFollowers( options );
			assert.equal( followersAgain.length, 4 );
		} );

		it( 'Pagination data should update when we fetch more followers', function() {
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

	describe( 'Remove follower', function() {
		beforeEach( function() {
			Dispatcher.handleServerAction( actions.fetchedFollowers );
		} );
		it( 'Should remove a single follower.', function() {
			let followers = FollowersStore.getFollowers( options ),
				followersAgain;

			assert.equal( followers.length, 2 );
			Dispatcher.handleServerAction( actions.removeFollower );
			Dispatcher.handleServerAction( actions.removeFollowerSuccess );
			followersAgain = FollowersStore.getFollowers( options );
			assert.equal( followersAgain.length, 1 );
		} );
		it( 'Should restore a single follower on removal error.', function() {
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
