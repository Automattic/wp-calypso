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

describe( 'Email Followers Store', function() {
	let Dispatcher, EmailFollowersStore;

	useFakeDom();

	beforeEach( function() {
		Dispatcher = require( 'dispatcher' );
		EmailFollowersStore = require( 'lib/email-followers/store' );
	} );

	it( 'Store should be an object', function() {
		assert.isObject( EmailFollowersStore );
	} );

	describe( 'Fetch Email Followers', function() {
		beforeEach( function() {
			Dispatcher.handleServerAction( actions.fetchedFollowers );
		} );

		it( 'Should update the store on RECEIVE_EMAIL_FOLLOWERS', function() {
			const followers = EmailFollowersStore.getFollowers( options );
			assert.equal( 2, followers.length );
		} );

		it( 'The store should return an array of objects when fetching email followers', function() {
			const followers = EmailFollowersStore.getFollowers( options );
			assert.isArray( followers );
			assert.isObject( followers[ 0 ] );
		} );

		it( 'Fetching more email followers should update the array in the store', function() {
			let followers = EmailFollowersStore.getFollowers( options ),
				followersAgain;
			assert.equal( followers.length, 2 );
			Dispatcher.handleServerAction( actions.fetchedMoreFollowers );
			followersAgain = EmailFollowersStore.getFollowers( options );
			assert.equal( followersAgain.length, 4 );
		} );

		it( 'Pagination data should update when we fetch more email followers', function() {
			let pagination = EmailFollowersStore.getPaginationData( options );
			assert.equal( pagination.totalFollowers, 4 );
			assert.equal( pagination.numFollowersFetched, 2 );
			assert.equal( pagination.followersCurrentPage, 1 );
			Dispatcher.handleServerAction( actions.fetchedMoreFollowers );
			pagination = EmailFollowersStore.getPaginationData( options );
			assert.equal( pagination.numFollowersFetched, 4 );
			assert.equal( pagination.followersCurrentPage, 2 );
		} );
	} );

	describe( 'Remove follower', function() {
		beforeEach( function() {
			Dispatcher.handleServerAction( actions.fetchedFollowers );
		} );
		it( 'Should remove a single follower.', function() {
			let followers = EmailFollowersStore.getFollowers( options ),
				followersAgain;

			assert.equal( followers.length, 2 );
			Dispatcher.handleServerAction( actions.removeFollower );
			Dispatcher.handleServerAction( actions.removeFollowerSuccess );
			followersAgain = EmailFollowersStore.getFollowers( options );
			assert.equal( followersAgain.length, 1 );
		} );
		it( 'Should restore a single follower on removal error.', function() {
			let followers = EmailFollowersStore.getFollowers( options ),
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
