/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { subscribeToNewPostEmail, updateNewPostEmailSubscription, unsubscribeToNewPostEmail, subscribeToNewCommentEmail, unsubscribeToNewCommentEmail, follow, unfollow, syncComplete } from '../actions';
import { items, itemsCount } from '../reducer';
import { READER_RECORD_FOLLOW, READER_RECORD_UNFOLLOW, READER_FOLLOWS_RECEIVE, SERIALIZE, DESERIALIZE, READER_FOLLOW_ERROR } from 'state/action-types';

describe( 'reducer', () => {
	describe( '#itemsCount()', () => {
		it( 'should default to 0', () => {
			const state = itemsCount( undefined, {} );
			expect( state ).to.eql( 0 );
		} );

		it( 'should get set to whatever is in the payload', () => {
			const state = itemsCount( undefined, {
				type: READER_FOLLOWS_RECEIVE,
				payload: { totalCount: 20 },
			} );
			expect( state ).eql( 20 );
		} );
	} );

	describe( '#items()', () => {
		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should insert a new URL when followed', () => {
			const original = deepFreeze( {
				'discover.wordpress.com': { is_following: true },
				'dailypost.wordpress.com': { is_following: true },
			} );
			const state = items( original, {
				type: READER_RECORD_FOLLOW,
				payload: { url: 'http://data.blog' },
			} );
			expect( state[ 'data.blog' ] ).to.eql( { is_following: true } );
		} );

		it( 'should remove a URL when unfollowed', () => {
			const original = deepFreeze( {
				'discover.wordpress.com': { blog_ID: 123, is_following: true },
				'dailypost.wordpress.com': { blog_ID: 124, is_following: true },
			} );
			const state = items( original, {
				type: READER_RECORD_UNFOLLOW,
				payload: { url: 'http://discover.wordpress.com' },
			} );
			expect( state[ 'discover.wordpress.com' ] ).to.eql( { blog_ID: 123, is_following: false } );
		} );

		it( 'should accept a new set of follows', () => {
			const original = deepFreeze( {
				'discover.wordpress.com': { is_following: true, blog_ID: 123 },
				'dailypost.wordpress.com': { is_following: true, blog_ID: 124 },
			} );
			const incomingFollows = [
				{ URL: 'http://dailypost.wordpress.com', blog_ID: 125 },
				{ URL: 'https://postcardsfromthereader.wordpress.com', blog_ID: 126 },
			];
			const state = items( original, {
				type: READER_FOLLOWS_RECEIVE,
				payload: { follows: incomingFollows },
			} );

			// Updated follow
			expect( state[ 'dailypost.wordpress.com' ] ).to.eql( {
				is_following: true,
				blog_ID: 125,
				URL: 'http://dailypost.wordpress.com',
			} );

			// Brand new follow
			expect( state[ 'postcardsfromthereader.wordpress.com' ] ).to.eql( {
				is_following: true,
				blog_ID: 126,
				URL: 'https://postcardsfromthereader.wordpress.com',
			} );
		} );

		it( 'should only SERIALIZE followed items', () => {
			const original = deepFreeze( {
				'discover.wordpress.com': {
					feed_URL: 'http://discover.wordpress.com',
					URL: 'http://discover.wordpress.com',
					is_following: false,
					blog_ID: 123,
				},
				'dailypost.wordpress.com': {
					feed_URL: 'http://dailypost.wordpress.com',
					URL: 'http://dailypost.wordpress.com',
					is_following: true,
					blog_ID: 124,
				},
			} );
			expect( items( original, { type: SERIALIZE } ) ).to.eql( {
				'dailypost.wordpress.com': {
					feed_URL: 'http://dailypost.wordpress.com',
					URL: 'http://dailypost.wordpress.com',
					is_following: true,
					blog_ID: 124,
				},
			} );
		} );

		it( 'should deserialize good data', () => {
			const original = deepFreeze( {
				'dailypost.wordpress.com': {
					feed_URL: 'http://dailypost.wordpress.com',
					URL: 'http://dailypost.wordpress.com',
					is_following: true,
					blog_ID: 124,
				},
			} );

			expect( items( original, { type: DESERIALIZE } ) ).to.eql( original );
		} );

		it( 'should return the blank state for bad serialized data', () => {
			const original = deepFreeze( {
				'dailypost.wordpress.com': {
					URL: 'http://dailypost.wordpress.com',
					is_following: true,
					blog_ID: 124,
				},
			} );

			expect( items( original, { type: DESERIALIZE } ) ).to.eql( {} );
		} );

		it( 'should update when passed new post subscription info', () => {
			const original = deepFreeze( {
				'example.com': {
					is_following: true,
					blog_ID: 123,
					URL: 'http://example.com',
					delivery_methods: {
						email: {
							send_posts: false,
						},
					},
				},
			} );
			const state = items( original, subscribeToNewPostEmail( 123 ) );
			expect( state ).to.eql( {
				'example.com': {
					is_following: true,
					blog_ID: 123,
					URL: 'http://example.com',
					delivery_methods: {
						email: {
							send_posts: true,
						},
					},
				},
			} );
		} );

		it( 'should not update when passed identical new post subscription info', () => {
			const original = deepFreeze( {
				'example.com': {
					is_following: true,
					blog_ID: 123,
					URL: 'http://example.com',
					delivery_methods: {
						email: {
							send_posts: true,
						},
					},
				},
			} );
			const state = items( original, subscribeToNewPostEmail( 123 ) );
			expect( state ).to.equal( original );
		} );

		it( 'should not update when passed bad new post subscription info', () => {
			const original = deepFreeze( {
				'example.com': {
					is_following: true,
					blog_ID: 123,
					URL: 'http://example.com',
					delivery_methods: {
						email: {
							send_posts: false,
						},
					},
				},
			} );
			const state = items( original, subscribeToNewPostEmail( 456 ) );
			expect( state ).to.equal( original );
		} );

		it( 'should update when passed updated post subscription info', () => {
			const original = deepFreeze( {
				'example.com': {
					is_following: true,
					blog_ID: 123,
					URL: 'http://example.com',
					delivery_methods: {
						email: {
							send_posts: true,
						},
					},
				},
			} );

			[ 'instantly', 'daily', 'weekly' ].forEach( frequency => {
				const state = items( original, updateNewPostEmailSubscription( 123, frequency ) );
				expect( state ).to.eql( {
					'example.com': {
						is_following: true,
						blog_ID: 123,
						URL: 'http://example.com',
						delivery_methods: {
							email: {
								send_posts: true,
								post_delivery_frequency: frequency,
							},
						},
					},
				} );
			} );
		} );

		it( 'should not update when passed identical updated post subscription info', () => {
			[ 'instantly', 'daily', 'weekly' ].forEach( frequency => {
				const original = deepFreeze( {
					'example.com': {
						is_following: true,
						blog_ID: 123,
						URL: 'http://example.com',
						delivery_methods: {
							email: {
								send_posts: true,
								post_delivery_frequency: frequency,
							},
						},
					},
				} );
				const state = items( original, updateNewPostEmailSubscription( 123, frequency ) );
				expect( state ).to.equal( original );
			} );
		} );

		it( 'should not update when passed bad updated post subscription info', () => {
			const original = deepFreeze( {
				'example.com': {
					is_following: true,
					blog_ID: 123,
					URL: 'http://example.com',
					delivery_methods: {
						email: {
							send_posts: true,
						},
					},
				},
			} );

			[ 'instantly', 'daily', 'weekly' ].forEach( frequency => {
				const state = items( original, updateNewPostEmailSubscription( 456, frequency ) );
				expect( state ).to.equal( original );
			} );
		} );

		it( 'should update when passed post unsubscription info', () => {
			const original = deepFreeze( {
				'example.com': {
					is_following: true,
					blog_ID: 123,
					URL: 'http://example.com',
					delivery_methods: {
						email: {
							send_posts: true,
							post_delivery_frequency: 'instantly',
						},
					},
				},
			} );
			const state = items( original, unsubscribeToNewPostEmail( 123 ) );
			expect( state ).to.eql( {
				'example.com': {
					is_following: true,
					blog_ID: 123,
					URL: 'http://example.com',
					delivery_methods: {
						email: {
							send_posts: false,
							post_delivery_frequency: 'instantly',
						},
					},
				},
			} );
		} );

		it( 'should not update when passed identical post unsubscription info', () => {
			const original = deepFreeze( {
				'example.com': {
					is_following: true,
					blog_ID: 123,
					URL: 'http://example.com',
					delivery_methods: {
						email: {
							send_posts: false,
							post_delivery_frequency: 'instantly',
						},
					},
				},
			} );
			const state = items( original, unsubscribeToNewPostEmail( 123 ) );
			expect( state ).to.equal( original );
		} );

		it( 'should not update when passed bad post unsubscription info', () => {
			const original = deepFreeze( {
				'example.com': {
					is_following: true,
					blog_ID: 123,
					URL: 'http://example.com',
					delivery_methods: {
						email: {
							send_posts: true,
							post_delivery_frequency: 'instantly',
						},
					},
				},
			} );
			const state = items( original, unsubscribeToNewPostEmail( 456 ) );
			expect( state ).to.equal( original );
		} );

		it( 'should update when passed comment subscription info', () => {
			const original = deepFreeze( {
				'example.com': {
					is_following: true,
					blog_ID: 123,
					URL: 'http://example.com',
					delivery_methods: {
						email: {
							send_comments: false,
						},
					},
				},
			} );
			const state = items( original, subscribeToNewCommentEmail( 123 ) );
			expect( state ).to.eql( {
				'example.com': {
					is_following: true,
					blog_ID: 123,
					URL: 'http://example.com',
					delivery_methods: {
						email: {
							send_comments: true,
						},
					},
				},
			} );
		} );

		it( 'should not update when passed identical comment subscription info', () => {
			const original = deepFreeze( {
				'example.com': {
					is_following: true,
					blog_ID: 123,
					URL: 'http://example.com',
					delivery_methods: {
						email: {
							send_comments: true,
						},
					},
				},
			} );
			const state = items( original, subscribeToNewCommentEmail( 123 ) );
			expect( state ).to.equal( original );
		} );

		it( 'should not update when passed comment sub info about a missing sub', () => {
			const original = deepFreeze( {
				'example.com': {
					is_following: true,
					blog_ID: 123,
					URL: 'http://example.com',
					delivery_methods: {
						email: {
							send_comments: true,
						},
					},
				},
			} );
			const state = items( original, subscribeToNewCommentEmail( 456 ) );
			expect( state ).to.equal( original );
		} );

		it( 'should update when passed comment unsubscription info', () => {
			const original = deepFreeze( {
				'example.com': {
					is_following: true,
					blog_ID: 123,
					URL: 'http://example.com',
					delivery_methods: {
						email: {
							send_comments: true,
						},
					},
				},
			} );
			const state = items( original, unsubscribeToNewCommentEmail( 123 ) );
			expect( state ).to.eql( {
				'example.com': {
					is_following: true,
					blog_ID: 123,
					URL: 'http://example.com',
					delivery_methods: {
						email: {
							send_comments: false,
						},
					},
				},
			} );
		} );

		it( 'should not update when passed identical comment unsubscription info', () => {
			const original = deepFreeze( {
				'example.com': {
					is_following: true,
					blog_ID: 123,
					URL: 'http://example.com',
					delivery_methods: {
						email: {
							send_comments: false,
						},
					},
				},
			} );
			const state = items( original, unsubscribeToNewCommentEmail( 123 ) );
			expect( state ).to.equal( original );
		} );

		it( 'should not update when passed bad comment unsubscription info', () => {
			const original = deepFreeze( {
				'example.com': {
					is_following: true,
					blog_ID: 123,
					URL: 'http://example.com',
					delivery_methods: {
						email: {
							send_comments: true,
						},
					},
				},
			} );
			const state = items( original, unsubscribeToNewCommentEmail( 456 ) );
			expect( state ).to.equal( original );
		} );

		it( 'should insert a follow error if one is received', () => {
			const original = deepFreeze( {
				'discoverinvalid.wordpress.com': { is_following: true },
				'dailypost.wordpress.com': { is_following: true },
			} );
			const state = items( original, {
				type: READER_FOLLOW_ERROR,
				payload: { feedUrl: 'http://discoverinvalid.wordpress.com', error: 'invalid_feed' },
			} );
			expect( state[ 'discoverinvalid.wordpress.com' ] ).to.eql( {
				is_following: true,
				error: 'invalid_feed',
			} );
		} );
	} );

	describe( 'follow', () => {
		it( 'should mark an existing feed as followed, add in a feed_URL if missing, and leave the rest alone', () => {
			const original = deepFreeze( {
				'example.com': {
					is_following: false,
					blog_ID: 123,
				},
			} );

			const state = items( original, follow( 'http://example.com' ) );
			expect( state ).to.eql( {
				'example.com': {
					is_following: true,
					feed_URL: 'http://example.com',
					blog_ID: 123,
				},
			} );
		} );

		it( 'should create a new entry for a new follow', () => {
			const state = items( {}, follow( 'http://example.com' ) );
			expect( state ).to.eql( {
				'example.com': {
					feed_URL: 'http://example.com',
					is_following: true,
				},
			} );
		} );

		it( 'should update an existing subscription', () => {
			const original = deepFreeze( {
				'example.com': {
					is_following: true,
					feed_URL: 'http://example.com',
				},
			} );

			const subscriptionInfo = {
				ID: 25,
				blog_ID: 10,
				feed_ID: 20,
				feed_URL: 'http://example.com',
				delivery_methods: {
					email: {
						send_posts: true,
					},
				},
			};

			const state = items( original, follow( 'http://example.com', subscriptionInfo ) );
			expect( state ).to.eql( {
				'example.com': {
					...subscriptionInfo,
					is_following: true,
				},
			} );
		} );

		it( 'should update the feed key when an existing subscription changes feed URL', () => {
			const original = deepFreeze( {
				'example.com': {
					is_following: true,
					feed_URL: 'http://example.com',
				},
			} );

			const subscriptionInfo = {
				ID: 25,
				blog_ID: 10,
				feed_ID: 20,
				feed_URL: 'http://example.com/feed',
				delivery_methods: {
					email: {
						send_posts: true,
					},
				},
			};

			const state = items( original, follow( 'http://example.com', subscriptionInfo ) );
			expect( state ).to.eql( {
				'example.com/feed': {
					...subscriptionInfo,
					is_following: true,
					alias_feed_URLs: [ 'example.com' ],
				},
			} );
		} );
	} );

	describe( 'unfollow', () => {
		it( 'should mark an existing follow as unfollowed', () => {
			const original = deepFreeze( {
				'example.com': {
					is_following: true,
					feed_URL: 'http://example.com',
					blog_ID: 123,
				},
			} );

			const state = items( original, unfollow( 'http://example.com' ) );
			expect( state ).to.eql( {
				'example.com': {
					is_following: false,
					feed_URL: 'http://example.com',
					blog_ID: 123,
				},
			} );
		} );

		it( 'should return the original state when already unfollowed', () => {
			const original = deepFreeze( {
				'example.com': {
					is_following: false,
					feed_URL: 'http://example.com',
					blog_ID: 123,
				},
			} );

			const state = items( original, unfollow( 'http://example.com' ) );
			expect( state ).to.equal( original );
		} );

		it( 'should return the same state for an item that does not exist', () => {
			const original = deepFreeze( {} );
			const state = items( original, unfollow( 'http://example.com' ) );
			expect( state ).to.equal( original );
		} );
	} );

	describe( 'sync complete', () => {
		it( 'should remove followed sites not seen during sync', () => {
			const original = deepFreeze( {
				'example.com': {
					feed_URL: 'http://example.com',
					ID: 1,
					is_following: true,
				},
				'example2.com': {
					feed_URL: 'http://example2.com',
					ID: 2,
					is_following: true,
				},
			} );
			const state = items( original, syncComplete( [ 'http://example2.com' ] ) );
			expect( state ).to.eql( {
				'example2.com': {
					feed_URL: 'http://example2.com',
					ID: 2,
					is_following: true,
				},
			} );
		} );
	} );
} );
