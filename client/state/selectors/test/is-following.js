/**
 * External Dependencies
 */
import { expect } from 'chai';
import deepfreeze from 'deep-freeze';

/**
 * Internal Dependencies
 */
import isFollowing from '../is-following';

describe( 'is-following', () => {
	const state = deepfreeze( {
		reader: {
			follows: {
				items: {
					'example.com': {
						feed_ID: 1,
						blog_ID: 2,
						URL: 'https://example.com/feed',
						is_following: true,
					},
					'badexample.com': {
						feed_ID: 10,
						blog_ID: 20,
						URL: 'https://badexample.com/feed',
						is_following: false,
					}
				}
			}
		}
	} );
	it( 'should find an item by feed ID', () => {
		expect( isFollowing( state, { feedId: 1 } ) ).to.be.true;
	} );
	it( 'should find an item by blog ID', () => {
		expect( isFollowing( state, { blogId: 2 } ) ).to.be.true;
	} );
	it( 'should find an item by url', () => {
		expect( isFollowing( state, { feedUrl: 'https://example.com/feed' } ) ).to.be.true;
	} );
	it( 'should respect is_following', () => {
		expect( isFollowing( state, { feedId: 10 } ) ).to.be.false;
	} );
	it( 'should return false for an unknown follow', () => {
		expect( isFollowing( state, { feedId: -1 } ) ).to.be.false;
	} );
} );
