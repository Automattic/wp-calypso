/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	READER_FOLLOW,
	READER_UNFOLLOW,
	READER_FOLLOWS_RECEIVE,
} from 'state/action-types';
import {
	items
} from '../reducer';

describe( 'reducer', () => {
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
				type: READER_FOLLOW,
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
				type: READER_UNFOLLOW,
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
	} );
} );
