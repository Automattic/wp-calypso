/** @format */
jest.mock( 'lib/wp', () => require( './mocks/lib/wp' ) );

/**
 * External Dependencies
 */
import { expect } from 'chai';

describe( 'index', () => {
	let Dispatcher, LikeStore;

	beforeAll( () => {
		LikeStore = require( '../like-store' );
		Dispatcher = require( 'dispatcher' );
	} );

	beforeEach( () => {
		LikeStore._reset();
	} );

	test( 'should have a dispatch token', () => {
		expect( LikeStore ).to.have.property( 'dispatchToken' );
	} );

	test( 'should return the full list of likes for a post', () => {
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_POST_LIKES',
			siteId: 444,
			postId: 123,
			data: {
				post_ID: 123,
				site_ID: 444,
				likes: [ { ID: 555, login: 'bluefuton' } ],
			},
			error: null,
		} );

		// getLikesForPost( site_ID, post_ID )
		const likes = LikeStore.getLikersForPost( 444, 123 );
		expect( likes ).to.be.ok;
		expect( likes[ 0 ].login ).to.eq( 'bluefuton' );
		expect( likes ).to.have.lengthOf( 1 );
	} );

	test( 'should return a count of likes for a post', () => {
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_POST_LIKES',
			postId: 123,
			siteId: 444,
			data: {
				post_ID: 123,
				site_ID: 444,
				found: 9000,
				likes: [ { ID: 555, login: 'bluefuton' }, { ID: 556, login: 'blowery' } ],
			},
			error: null,
		} );

		const likeCount = LikeStore.getLikeCountForPost( 444, 123 );
		expect( likeCount ).to.be.ok;
		expect( likeCount ).to.eq( 9000 );
	} );

	test( 'should tell me if the current user has liked a post', () => {
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_POST_LIKES',
			postId: 123,
			siteId: 444,
			data: {
				post_ID: 123,
				site_ID: 444,
				i_like: true,
				found: 100,
				likes: [ { ID: 555, login: 'bluefuton' } ],
			},
			error: null,
		} );

		expect( LikeStore.isPostLikedByCurrentUser( 444, 123 ) ).to.be.true;
	} );

	test( 'should ignore a response without a post ID', () => {
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_POST_LIKES',
			data: {
				post_ID: null,
				site_ID: 444,
				likes: [ { ID: 555 } ],
			},
			error: null,
		} );

		expect( LikeStore._all() ).to.be.empty;
	} );

	test( 'should ignore a response with an error', () => {
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_POST_LIKES',
			data: {
				post_ID: 1,
				site_ID: 444,
				likes: [ { ID: 123, login: 'bluefuton' } ],
			},
			error: new Error(),
		} );

		expect( LikeStore._all() ).to.be.empty;
	} );

	test( 'should add a new like and unlike for the current user', () => {
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_POST_LIKES',
			siteId: 555,
			postId: 123,
			data: {
				site_ID: 555,
				post_ID: 123,
				likes: [],
				found: 0,
			},
			error: null,
		} );

		Dispatcher.handleServerAction( {
			type: 'RECEIVE_LIKE_RESPONSE',
			siteId: 555,
			postId: 123,
			data: {
				success: true,
				i_like: true,
				like_count: 1,
				site_ID: 555,
				post_ID: 123,
			},
			error: null,
		} );

		expect( LikeStore.isPostLikedByCurrentUser( 555, 123 ) ).to.be.true;

		Dispatcher.handleServerAction( {
			type: 'RECEIVE_UNLIKE_RESPONSE',
			siteId: 555,
			postId: 123,
			data: {
				success: true,
				i_like: false,
				like_count: 0,
				site_ID: 555,
				post_ID: 123,
			},
			error: null,
		} );

		expect( LikeStore.isPostLikedByCurrentUser( 555, 123 ) ).to.be.false;
	} );

	test( 'should ignore external feed post items', () => {
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_FEED_POST',
			id: '1234',
			error: null,
			data: {
				is_external: true,
				site_ID: 1234,
				ID: 1,
				like_count: 100,
			},
		} );

		expect( LikeStore.getLikeCountForPost( 1234, 1 ) ).to.be.null;
		expect( LikeStore.getLikersForPost( 1234, 1 ) ).to.be.null;
	} );

	test( 'should ignore error feed post items', () => {
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_FEED_POST',
			id: '1234',
			error: null,
			data: { errors: [] },
		} );

		expect( LikeStore.getLikeCountForPost( 1234, 1 ) ).to.be.null;
		expect( LikeStore.getLikersForPost( 1234, 1 ) ).to.be.null;
	} );

	test( 'should ignore feed post items with no count', () => {
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_FEED_POST',
			id: '1234',
			error: null,
			data: {
				likes_enabled: true,
				is_external: false,
				site_ID: 1234,
				ID: 1,
			},
		} );

		expect( LikeStore.getLikeCountForPost( 1234, 1 ) ).to.be.null;
		expect( LikeStore.getLikersForPost( 1234, 1 ) ).to.be.null;
	} );
} );
