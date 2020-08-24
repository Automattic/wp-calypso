/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	subscribeToNewPostEmail,
	updateNewPostEmailSubscription,
	unsubscribeToNewPostEmail,
	subscribeToNewCommentEmail,
	unsubscribeToNewCommentEmail,
	subscribeToNewPostNotifications,
	unsubscribeToNewPostNotifications,
	follow,
	unfollow,
	syncComplete,
} from '../actions';
import { items, itemsCount } from '../reducer';
import {
	READER_UNFOLLOW,
	READER_RECORD_FOLLOW,
	READER_RECORD_UNFOLLOW,
	READER_FOLLOWS_RECEIVE,
	READER_FOLLOW_ERROR,
	READER_SITE_REQUEST_SUCCESS,
} from 'state/reader/action-types';
import { SERIALIZE, DESERIALIZE } from 'state/action-types';

const exampleFollow = {
	is_following: true,
	blog_ID: 123,
	URL: 'http://example.com',
	feed_URL: 'http://example.com',
	delivery_methods: {
		email: {
			send_posts: false,
		},
		notification: {},
	},
};

describe( 'reducer', () => {
	describe( '#itemsCount()', () => {
		test( 'should default to 0', () => {
			const state = itemsCount( undefined, {} );
			expect( state ).toBe( 0 );
		} );

		test( 'should get set to whatever is in the payload', () => {
			const state = itemsCount( undefined, {
				type: READER_FOLLOWS_RECEIVE,
				payload: { totalCount: 20 },
			} );
			expect( state ).toBe( 20 );
		} );
	} );

	describe( '#items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );
			expect( state ).toEqual( {} );
		} );

		test( 'should insert a new URL when followed', () => {
			const original = deepFreeze( {
				'discover.wordpress.com': { is_following: true },
				'dailypost.wordpress.com': { is_following: true },
			} );
			const state = items( original, {
				type: READER_RECORD_FOLLOW,
				payload: { url: 'http://data.blog' },
			} );
			expect( state[ 'data.blog' ] ).toEqual( { is_following: true } );
		} );

		test( 'should remove a URL when unfollowed', () => {
			const original = deepFreeze( {
				'discover.wordpress.com': { blog_ID: 123, is_following: true },
				'dailypost.wordpress.com': { blog_ID: 124, is_following: true },
			} );
			const state = items( original, {
				type: READER_RECORD_UNFOLLOW,
				payload: { url: 'http://discover.wordpress.com' },
			} );
			expect( state[ 'discover.wordpress.com' ] ).toEqual( {
				blog_ID: 123,
				is_following: false,
			} );
		} );

		test( 'should optimistically turn off new post notifications when unfollowed', () => {
			const original = deepFreeze( {
				'example.com': { is_following: true },
			} );
			const state = items( original, {
				type: READER_UNFOLLOW,
				payload: { feedUrl: 'http://example.com' },
			} );
			expect( state[ 'example.com' ] ).toMatchObject( {
				is_following: false,
				delivery_methods: { notification: { send_posts: false } },
			} );
		} );

		test( 'should accept a new set of follows', () => {
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
			expect( state[ 'dailypost.wordpress.com' ] ).toEqual( {
				is_following: true,
				blog_ID: 125,
				URL: 'http://dailypost.wordpress.com',
			} );

			// Brand new follow
			expect( state[ 'postcardsfromthereader.wordpress.com' ] ).toEqual( {
				is_following: true,
				blog_ID: 126,
				URL: 'https://postcardsfromthereader.wordpress.com',
			} );
		} );

		test( 'should only SERIALIZE followed items with an ID', () => {
			const original = deepFreeze( {
				'discover.wordpress.com': {
					ID: 1,
					feed_URL: 'http://discover.wordpress.com',
					URL: 'http://discover.wordpress.com',
					is_following: false,
					blog_ID: 123,
				},
				'dailypost.wordpress.com': {
					ID: 2,
					feed_URL: 'http://dailypost.wordpress.com',
					URL: 'http://dailypost.wordpress.com',
					is_following: true,
					blog_ID: 124,
				},
				'in-flight.wordpress.com': {
					feed_URL: 'http://in-flight.wordpress.com',
					URL: 'http://in-flight.wordpress.com',
					is_following: true,
					blog_ID: 125,
				},
			} );
			expect( items( original, { type: SERIALIZE } ) ).toEqual( {
				'dailypost.wordpress.com': {
					ID: 2,
					feed_URL: 'http://dailypost.wordpress.com',
					URL: 'http://dailypost.wordpress.com',
					is_following: true,
					blog_ID: 124,
				},
			} );
		} );

		test( 'should deserialize good data', () => {
			const original = deepFreeze( {
				'dailypost.wordpress.com': {
					feed_URL: 'http://dailypost.wordpress.com',
					URL: 'http://dailypost.wordpress.com',
					is_following: true,
					blog_ID: 124,
				},
			} );

			expect( items( original, { type: DESERIALIZE } ) ).toBe( original );
		} );

		test( 'should return the blank state for bad serialized data', () => {
			const original = deepFreeze( {
				'dailypost.wordpress.com': {
					URL: 'http://dailypost.wordpress.com',
					is_following: true,
					blog_ID: 124,
				},
			} );

			expect( items( original, { type: DESERIALIZE } ) ).toEqual( {} );
		} );

		test( 'should update when passed new post email subscription info', () => {
			const original = deepFreeze( {
				'example.com': {
					...exampleFollow,
					delivery_methods: {
						email: {
							send_posts: false,
						},
						notification: {},
					},
				},
			} );
			const state = items( original, subscribeToNewPostEmail( 123 ) );
			expect( state ).toEqual( {
				'example.com': {
					...exampleFollow,
					delivery_methods: {
						email: {
							send_posts: true,
						},
						notification: {},
					},
				},
			} );
		} );

		test( 'should not update when passed identical new post email subscription info', () => {
			const original = deepFreeze( {
				'example.com': {
					...exampleFollow,
					delivery_methods: {
						email: {
							send_posts: true,
						},
					},
				},
			} );
			const state = items( original, subscribeToNewPostEmail( 123 ) );
			expect( state ).toBe( original );
		} );

		test( 'should not update when passed bad new post email subscription info', () => {
			const original = deepFreeze( {
				'example.com': {
					...exampleFollow,
					delivery_methods: {
						email: {
							send_posts: false,
						},
					},
				},
			} );
			const state = items( original, subscribeToNewPostEmail( 456 ) );
			expect( state ).toBe( original );
		} );

		test( 'should update when passed updated post email subscription info', () => {
			const original = deepFreeze( {
				'example.com': {
					...exampleFollow,
					delivery_methods: {
						email: {
							send_posts: true,
						},
						notification: {},
					},
				},
			} );

			[ 'instantly', 'daily', 'weekly' ].forEach( ( frequency ) => {
				const state = items( original, updateNewPostEmailSubscription( 123, frequency ) );
				expect( state ).toEqual( {
					'example.com': {
						...exampleFollow,
						delivery_methods: {
							email: {
								send_posts: true,
								post_delivery_frequency: frequency,
							},
							notification: {},
						},
					},
				} );
			} );
		} );

		test( 'should not update when passed identical updated post email subscription info', () => {
			[ 'instantly', 'daily', 'weekly' ].forEach( ( frequency ) => {
				const original = deepFreeze( {
					'example.com': {
						...exampleFollow,
						delivery_methods: {
							email: {
								send_posts: true,
								post_delivery_frequency: frequency,
							},
						},
					},
				} );
				const state = items( original, updateNewPostEmailSubscription( 123, frequency ) );
				expect( state ).toBe( original );
			} );
		} );

		test( 'should not update when passed bad updated post email subscription info', () => {
			const original = deepFreeze( {
				'example.com': {
					...exampleFollow,
					delivery_methods: {
						email: {
							send_posts: true,
						},
					},
				},
			} );

			[ 'instantly', 'daily', 'weekly' ].forEach( ( frequency ) => {
				const state = items( original, updateNewPostEmailSubscription( 456, frequency ) );
				expect( state ).toBe( original );
			} );
		} );

		test( 'should update when passed post email unsubscription info', () => {
			const original = deepFreeze( {
				'example.com': {
					...exampleFollow,
					delivery_methods: {
						email: {
							send_posts: true,
							post_delivery_frequency: 'instantly',
						},
						notification: {},
					},
				},
			} );
			const state = items( original, unsubscribeToNewPostEmail( 123 ) );
			expect( state ).toEqual( {
				'example.com': {
					...exampleFollow,
					delivery_methods: {
						email: {
							send_posts: false,
							post_delivery_frequency: 'instantly',
						},
						notification: {},
					},
				},
			} );
		} );

		test( 'should not update when passed identical post email unsubscription info', () => {
			const original = deepFreeze( {
				'example.com': {
					...exampleFollow,
					delivery_methods: {
						email: {
							send_posts: false,
							post_delivery_frequency: 'instantly',
						},
					},
				},
			} );
			const state = items( original, unsubscribeToNewPostEmail( 123 ) );
			expect( state ).toBe( original );
		} );

		test( 'should not update when passed bad post email unsubscription info', () => {
			const original = deepFreeze( {
				'example.com': {
					...exampleFollow,
					delivery_methods: {
						email: {
							send_posts: true,
							post_delivery_frequency: 'instantly',
						},
					},
				},
			} );
			const state = items( original, unsubscribeToNewPostEmail( 456 ) );
			expect( state ).toBe( original );
		} );

		test( 'should update when passed comment email subscription info', () => {
			const original = deepFreeze( {
				'example.com': {
					is_following: true,
					blog_ID: 123,
					URL: 'http://example.com',
					delivery_methods: {
						email: {
							send_comments: false,
						},
						notification: {},
					},
				},
			} );
			const state = items( original, subscribeToNewCommentEmail( 123 ) );
			expect( state ).toEqual( {
				'example.com': {
					is_following: true,
					blog_ID: 123,
					URL: 'http://example.com',
					delivery_methods: {
						email: {
							send_comments: true,
						},
						notification: {},
					},
				},
			} );
		} );

		test( 'should not update when passed identical comment email subscription info', () => {
			const original = deepFreeze( {
				'example.com': {
					...exampleFollow,
					delivery_methods: {
						email: {
							send_comments: true,
						},
					},
				},
			} );
			const state = items( original, subscribeToNewCommentEmail( 123 ) );
			expect( state ).toBe( original );
		} );

		test( 'should not update when passed comment email sub info about a missing sub', () => {
			const original = deepFreeze( {
				'example.com': {
					...exampleFollow,
					delivery_methods: {
						email: {
							send_comments: true,
						},
					},
				},
			} );
			const state = items( original, subscribeToNewCommentEmail( 456 ) );
			expect( state ).toBe( original );
		} );

		test( 'should update when passed comment email unsubscription info', () => {
			const original = deepFreeze( {
				'example.com': {
					...exampleFollow,
					delivery_methods: {
						email: {
							send_comments: true,
						},
						notification: {},
					},
				},
			} );
			const state = items( original, unsubscribeToNewCommentEmail( 123 ) );
			expect( state ).toEqual( {
				'example.com': {
					...exampleFollow,
					delivery_methods: {
						email: {
							send_comments: false,
						},
						notification: {},
					},
				},
			} );
		} );

		test( 'should not update when passed identical comment email unsubscription info', () => {
			const original = deepFreeze( {
				'example.com': {
					...exampleFollow,
					delivery_methods: {
						email: {
							send_comments: false,
						},
					},
				},
			} );
			const state = items( original, unsubscribeToNewCommentEmail( 123 ) );
			expect( state ).toBe( original );
		} );

		test( 'should not update when passed bad comment email unsubscription info', () => {
			const original = deepFreeze( {
				'example.com': {
					exampleFollow,
					delivery_methods: {
						email: {
							send_comments: true,
						},
					},
				},
			} );
			const state = items( original, unsubscribeToNewCommentEmail( 456 ) );
			expect( state ).toBe( original );
		} );

		test( 'should update when a new post notification subscription is received', () => {
			const original = deepFreeze( {
				'example.com': {
					is_following: true,
					blog_ID: 123,
					URL: 'http://example.com',
					delivery_methods: {
						email: {
							send_posts: false,
						},
						notification: {
							send_posts: false,
						},
					},
				},
			} );
			const state = items( original, subscribeToNewPostNotifications( 123 ) );
			expect( state ).toEqual( {
				'example.com': {
					is_following: true,
					blog_ID: 123,
					URL: 'http://example.com',
					delivery_methods: {
						email: {
							send_posts: false,
						},
						notification: {
							send_posts: true,
						},
					},
				},
			} );
		} );

		test( 'should not update when a new post notification subscription is identical', () => {
			const original = deepFreeze( {
				'example.com': {
					is_following: true,
					blog_ID: 123,
					URL: 'http://example.com',
					delivery_methods: {
						email: {
							send_posts: true,
						},
						notification: {
							send_posts: true,
						},
					},
				},
			} );
			const state = items( original, subscribeToNewPostNotifications( 123 ) );
			expect( state ).toBe( original );
		} );

		test( 'should not update when a new post notification subscription for a non-existent follow is received', () => {
			const original = deepFreeze( {
				'example.com': {
					is_following: true,
					blog_ID: 123,
					URL: 'http://example.com',
					delivery_methods: {
						email: {
							send_posts: false,
						},
						notification: {
							send_posts: false,
						},
					},
				},
			} );
			const state = items( original, subscribeToNewPostNotifications( 456 ) );
			expect( state ).toBe( original );
		} );

		test( 'should update when a new post notification unsubscription is received', () => {
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
						notification: {
							send_posts: true,
						},
					},
				},
			} );
			const state = items( original, unsubscribeToNewPostNotifications( 123 ) );
			expect( state ).toEqual( {
				'example.com': {
					is_following: true,
					blog_ID: 123,
					URL: 'http://example.com',
					delivery_methods: {
						email: {
							send_posts: true,
							post_delivery_frequency: 'instantly',
						},
						notification: {
							send_posts: false,
						},
					},
				},
			} );
		} );

		test( 'should not update when a new post notification unsubscription is identical', () => {
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
						notification: {
							send_posts: false,
						},
					},
				},
			} );
			const state = items( original, unsubscribeToNewPostNotifications( 123 ) );
			expect( state ).toBe( original );
		} );

		test( 'should not update when a new post notification unsubscription for a non-existent follow is received', () => {
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
						notification: {
							send_posts: true,
						},
					},
				},
			} );
			const state = items( original, unsubscribeToNewPostNotifications( 456 ) );
			expect( state ).toBe( original );
		} );

		test( 'should insert a follow error if one is received', () => {
			const original = deepFreeze( {
				'discoverinvalid.wordpress.com': { is_following: true },
				'dailypost.wordpress.com': { is_following: true },
			} );
			const state = items( original, {
				type: READER_FOLLOW_ERROR,
				payload: { feedUrl: 'http://discoverinvalid.wordpress.com', error: 'invalid_feed' },
			} );
			expect( state[ 'discoverinvalid.wordpress.com' ] ).toEqual( {
				is_following: true,
				error: 'invalid_feed',
			} );
		} );

		test( 'should add a new follow from a site request', () => {
			const original = deepFreeze( {} );
			const incomingSite = {
				ID: 125,
				name: 'Postcards from the Reader',
				URL: 'https://postcardsfromthereader.wordpress.com',
				feed_URL: 'https://postcardsfromthereader.wordpress.com',
				is_following: true,
				subscription: {
					delivery_methods: {
						email: {
							send_posts: true,
							send_comments: false,
							post_delivery_frequency: 'weekly',
						},
					},
				},
			};

			const state = items( original, {
				type: READER_SITE_REQUEST_SUCCESS,
				payload: incomingSite,
			} );

			expect( state[ 'postcardsfromthereader.wordpress.com' ] ).toEqual( {
				is_following: true,
				blog_ID: 125,
				URL: 'https://postcardsfromthereader.wordpress.com',
				feed_URL: 'https://postcardsfromthereader.wordpress.com',
				delivery_methods: {
					email: {
						send_posts: true,
						send_comments: false,
						post_delivery_frequency: 'weekly',
					},
				},
			} );
		} );

		test( 'should update an existing follow from a site request', () => {
			const original = deepFreeze( {
				is_following: true,
				blog_ID: 125,
				URL: 'https://postcardsfromthereader.wordpress.com',
				feed_URL: 'https://postcardsfromthereader.wordpress.com',
				delivery_methods: {
					email: {
						send_posts: false,
						send_comments: true,
					},
				},
			} );
			const incomingSite = {
				ID: 125,
				name: 'Postcards from the Reader',
				URL: 'https://postcardsfromthereader.wordpress.com',
				feed_URL: 'https://postcardsfromthereader.wordpress.com',
				is_following: true,
				subscription: {
					delivery_methods: {
						email: {
							send_posts: true,
							send_comments: false,
							post_delivery_frequency: 'weekly',
						},
					},
				},
			};

			const state = items( original, {
				type: READER_SITE_REQUEST_SUCCESS,
				payload: incomingSite,
			} );

			expect( state[ 'postcardsfromthereader.wordpress.com' ] ).toEqual( {
				is_following: true,
				blog_ID: 125,
				URL: 'https://postcardsfromthereader.wordpress.com',
				feed_URL: 'https://postcardsfromthereader.wordpress.com',
				delivery_methods: {
					email: {
						send_posts: true,
						send_comments: false,
						post_delivery_frequency: 'weekly',
					},
				},
			} );
		} );

		test( 'should disregard a site with no feed URL from a site request', () => {
			const original = deepFreeze( {} );
			const incomingSite = {
				ID: 125,
				name: 'Postcards from the Reader',
				URL: 'https://postcardsfromthereader.wordpress.com',
				feed_URL: null,
				is_following: false,
			};

			const state = items( original, {
				type: READER_SITE_REQUEST_SUCCESS,
				payload: incomingSite,
			} );

			expect( state[ 'postcardsfromthereader.wordpress.com' ] ).toBe( undefined );
		} );
	} );

	describe( 'follow', () => {
		test( 'should mark an existing feed as followed, add in a feed_URL if missing, and leave the rest alone', () => {
			const original = deepFreeze( {
				'example.com': {
					...exampleFollow,
					is_following: false,
				},
			} );

			const state = items( original, follow( 'http://example.com' ) );
			expect( state ).toEqual( {
				'example.com': {
					...exampleFollow,
					is_following: true,
				},
			} );
		} );

		test( 'should create a new entry for a new follow', () => {
			const state = items( {}, follow( 'http://example.com' ) );
			expect( state ).toEqual( {
				'example.com': {
					feed_URL: 'http://example.com',
					is_following: true,
				},
			} );
		} );

		test( 'should update an existing subscription', () => {
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
			expect( state ).toEqual( {
				'example.com': {
					...subscriptionInfo,
					is_following: true,
				},
			} );
		} );

		test( 'should update the feed key when an existing subscription changes feed URL', () => {
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
			expect( state ).toEqual( {
				'example.com/feed': {
					...subscriptionInfo,
					is_following: true,
					alias_feed_URLs: [ 'example.com' ],
				},
			} );
		} );
	} );

	describe( 'unfollow', () => {
		test( 'should mark an existing follow as unfollowed', () => {
			const original = deepFreeze( {
				'example.com': {
					...exampleFollow,
					is_following: true,
				},
			} );

			const state = items( original, unfollow( 'http://example.com' ) );
			expect( state ).toMatchObject( {
				'example.com': {
					...exampleFollow,
					is_following: false,
				},
			} );
		} );

		test( 'should return the original state when already unfollowed', () => {
			const original = deepFreeze( {
				'example.com': {
					...exampleFollow,
					is_following: false,
				},
			} );

			const state = items( original, unfollow( 'http://example.com' ) );
			expect( state ).toBe( original );
		} );

		test( 'should return the same state for an item that does not exist', () => {
			const original = deepFreeze( {} );
			const state = items( original, unfollow( 'http://example.com' ) );
			expect( state ).toBe( original );
		} );
	} );

	describe( 'sync complete', () => {
		test( 'should remove followed sites not seen during sync', () => {
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
			expect( state ).toEqual( {
				'example2.com': {
					feed_URL: 'http://example2.com',
					ID: 2,
					is_following: true,
				},
			} );
		} );
	} );
} );
