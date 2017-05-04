/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	READER_RECORD_FOLLOW,
	READER_RECORD_UNFOLLOW,
	READER_FOLLOWS_RECEIVE,
} from 'state/action-types';
import {
	subscribeToNewPostEmail,
	updateNewPostEmailSubscription,
	unsubscribeToNewPostEmail,
	subscribeToNewCommentEmail,
	unsubscribeToNewCommentEmail,
	follow,
	unfollow,
	updateFollow,

} from '../actions';
import { items, itemsCount } from '../reducer';

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
				payload: { url: 'http://discover.wordpress.com' }
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
				payload: { follows: incomingFollows }
			} );

			// Updated follow
			expect( state[ 'dailypost.wordpress.com' ] ).to.eql(
				{ is_following: true, blog_ID: 125, URL: 'http://dailypost.wordpress.com' }
			);

			// Brand new follow
			expect( state[ 'postcardsfromthereader.wordpress.com' ] ).to.eql(
				{ is_following: true, blog_ID: 126, URL: 'https://postcardsfromthereader.wordpress.com' }
			);
		} );

		it( 'should update when passed new post subscription info', () => {
			const original = deepFreeze( {
				'example.com': {
					is_following: true,
					blog_ID: 123,
					URL: 'http://example.com',
					delivery_methods: {
						email: {
							send_posts: false
						}
					}
				}
			} );
			const state = items( original, subscribeToNewPostEmail( 123 ) );
			expect( state ).to.eql( {
				'example.com': {
					is_following: true,
					blog_ID: 123,
					URL: 'http://example.com',
					delivery_methods: {
						email: {
							send_posts: true
						}
					}
				}
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
							send_posts: true
						}
					}
				}
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
							send_posts: false
						}
					}
				}
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
							send_posts: true
						}
					}
				}
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
							}
						}
					}
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
							}
						}
					}
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
							send_posts: true
						}
					}
				}
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
						}
					}
				}
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
						}
					}
				}
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
						}
					}
				}
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
						}
					}
				}
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
							send_comments: false
						}
					}
				}
			} );
			const state = items( original, subscribeToNewCommentEmail( 123 ) );
			expect( state ).to.eql( {
				'example.com': {
					is_following: true,
					blog_ID: 123,
					URL: 'http://example.com',
					delivery_methods: {
						email: {
							send_comments: true
						}
					}
				}
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
							send_comments: true
						}
					}
				}
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
							send_comments: true
						}
					}
				}
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
							send_comments: true
						}
					}
				}
			} );
			const state = items( original, unsubscribeToNewCommentEmail( 123 ) );
			expect( state ).to.eql( {
				'example.com': {
					is_following: true,
					blog_ID: 123,
					URL: 'http://example.com',
					delivery_methods: {
						email: {
							send_comments: false
						}
					}
				}
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
							send_comments: false
						}
					}
				}
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
							send_comments: true
						}
					}
				}
			} );
			const state = items( original, unsubscribeToNewCommentEmail( 456 ) );
			expect( state ).to.equal( original );
		} );
	} );

	describe( 'follow', () => {
		it( 'should mark an existing feed as followed, add in a feed_URL if missing, and leave the rest alone', () => {
			const original = deepFreeze( {
				'example.com': {
					is_following: false,
					blog_ID: 123
				}
			} );

			const state = items( original, follow( 'http://example.com' ) );
			expect( state ).to.eql( {
				'example.com': {
					is_following: true,
					feed_URL: 'http://example.com',
					blog_ID: 123
				}
			} );
		} );

		it( 'should create a new entry for a new follow', () => {
			const state = items( {}, follow( 'http://example.com' ) );
			expect( state ).to.eql( {
				'example.com': {
					feed_URL: 'http://example.com',
					is_following: true
				}
			} );
		} );
	} );

	describe( 'unfollow', () => {
		it( 'should mark an existing follow as unfollowed', () => {
			const original = deepFreeze( {
				'example.com': {
					is_following: true,
					feed_URL: 'http://example.com',
					blog_ID: 123
				}
			} );

			const state = items( original, unfollow( 'http://example.com' ) );
			expect( state ).to.eql( {
				'example.com': {
					is_following: false,
					feed_URL: 'http://example.com',
					blog_ID: 123
				}
			} );
		} );

		it( 'should return the original state when already unfollowed', () => {
			const original = deepFreeze( {
				'example.com': {
					is_following: false,
					feed_URL: 'http://example.com',
					blog_ID: 123
				}
			} );

			const state = items( original, unfollow( 'http://example.com' ) );
			expect( state ).to.equal( original );
		} );

		it( 'should return the same state for an item that does not exist', () => {
			const original = deepFreeze( {} );
			const state = items( original, unfollow( 'http://example.com' ) );
			expect( state ).to.equal( original );
		} );	} );

	describe( 'updateFollow', () => {
		it( 'should do nothing for a follow that does not exist', () => {
			const original = deepFreeze( { } );
			const state = items(
				original,
				updateFollow(
					'http://example.com',
					{ hi: 'there' }
				)
			);
			expect( state ).to.equal( original );
		} );

		it( 'should update an existing subscription', () => {
			const original = deepFreeze( {
				'example.com': {
					is_following: true,
					feed_URL: 'http://example.com',
					blog_ID: 123
				}
			} );

			const subscriptionInfo = {
				ID: 25,
				blog_ID: 10,
				feed_ID: 20,
				feed_URL: 'http://example.com', // what should we do if the feed_URL doesn't match the feedUrl on the action??
				delivery_methods: {
					email: {
						send_posts: true
					}
				},
			};

			const state = items( original, updateFollow( 'http://example.com', subscriptionInfo ) );
			expect( state ).to.eql( {
				'example.com': {
					...subscriptionInfo,
					is_following: true,
				}
			} );
		} );
	} );
} );
