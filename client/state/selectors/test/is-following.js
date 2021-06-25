/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { isFollowing } from 'calypso/state/reader/follows/selectors';

describe( 'is-following', () => {
	const state = deepFreeze( {
		reader: {
			follows: {
				items: {
					'example.com/feed': {
						feed_ID: 1,
						blog_ID: 2,
						feed_URL: 'https://example.com/feed',
						alias_feed_URLs: [ 'alias.example.com' ],
						is_following: true,
					},
					'badexample.com/feed': {
						feed_ID: 10,
						blog_ID: 20,
						feed_URL: 'https://badexample.com/feed',
						is_following: false,
					},
				},
			},
		},
	} );

	test( 'should find an item by feed ID', () => {
		expect( isFollowing( state, { feedId: 1 } ) ).toBe( true );
	} );

	test( 'should find an item by blog ID', () => {
		expect( isFollowing( state, { blogId: 2 } ) ).toBe( true );
	} );

	test( 'should find an item by url', () => {
		expect( isFollowing( state, { feedUrl: 'https://example.com/feed' } ) ).toBe( true );
	} );

	test( 'should find an item by alias url', () => {
		expect( isFollowing( state, { feedUrl: 'http://alias.example.com' } ) ).toBe( true );
	} );

	test( 'should respect is_following', () => {
		expect( isFollowing( state, { feedId: 10 } ) ).toBe( false );
	} );

	test( 'should return false for an unknown follow', () => {
		expect( isFollowing( state, { feedId: -1 } ) ).toBe( false );
	} );
} );
