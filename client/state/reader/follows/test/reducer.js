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
	READER_UNFOLLOW
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
				'discover.wordpress.com': { isFollowing: true },
				'dailypost.wordpress.com': { isFollowing: true },
			} );
			const state = items( original, {
				type: READER_FOLLOW,
				url: 'http://data.blog'
			} );
			expect( state[ 'data.blog' ] ).to.eql( { isFollowing: true } );
		} );

		it( 'should remove a URL when unfollowed', () => {
			const original = deepFreeze( {
				'discover.wordpress.com': { isFollowing: true },
				'dailypost.wordpress.com': { isFollowing: true },
			} );
			const state = items( original, {
				type: READER_UNFOLLOW,
				url: 'http://discover.wordpress.com'
			} );
			expect( state[ 'discover.wordpress.com' ] ).to.eql( { isFollowing: false } );
		} );
	} );
} );
