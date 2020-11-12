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
import Dispatcher from 'calypso/dispatcher';
import EmailFollowersStore from 'calypso/lib/email-followers/store';

const options = { siteId: site.ID };

describe( 'Email Followers Store', () => {
	test( 'Store should be an object', () => {
		assert.isObject( EmailFollowersStore );
	} );

	describe( 'Fetch Email Followers', () => {
		beforeEach( () => {
			Dispatcher.handleServerAction( actions.fetchedFollowers );
		} );

		test( 'Should update the store on RECEIVE_EMAIL_FOLLOWERS', () => {
			const followers = EmailFollowersStore.getFollowers( options );
			assert.equal( 2, followers.length );
		} );

		test( 'The store should return an array of objects when fetching email followers', () => {
			const followers = EmailFollowersStore.getFollowers( options );
			assert.isArray( followers );
			assert.isObject( followers[ 0 ] );
		} );

		test( 'Fetching more email followers should update the array in the store', () => {
			const followers = EmailFollowersStore.getFollowers( options );
			assert.equal( followers.length, 2 );
			Dispatcher.handleServerAction( actions.fetchedMoreFollowers );
			const followersAgain = EmailFollowersStore.getFollowers( options );
			assert.equal( followersAgain.length, 4 );
		} );

		test( 'Pagination data should update when we fetch more email followers', () => {
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

	describe( 'Remove follower', () => {
		beforeEach( () => {
			Dispatcher.handleServerAction( actions.fetchedFollowers );
		} );
		test( 'Should remove a single follower.', () => {
			const followers = EmailFollowersStore.getFollowers( options );
			assert.equal( followers.length, 2 );
			Dispatcher.handleServerAction( actions.removeFollower );
			Dispatcher.handleServerAction( actions.removeFollowerSuccess );
			const followersAgain = EmailFollowersStore.getFollowers( options );
			assert.equal( followersAgain.length, 1 );
		} );
		test( 'Should restore a single follower on removal error.', () => {
			const followers = EmailFollowersStore.getFollowers( options );
			assert.equal( followers.length, 2 );
			Dispatcher.handleServerAction( actions.removeFollower );
			const followersAfterRemove = EmailFollowersStore.getFollowers( options );
			assert.equal( followersAfterRemove.length, 1 );
			Dispatcher.handleServerAction( actions.removeFollowerError );
			const followersAfterError = EmailFollowersStore.getFollowers( options );
			assert.equal( followersAfterError.length, 2 );
		} );
	} );
} );
