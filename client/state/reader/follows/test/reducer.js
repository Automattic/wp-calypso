/**
 * External dependencies
 */
import { expect } from 'chai';

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
		it( 'should default to an empty array', () => {
			const state = items( undefined, [] );
			expect( state ).to.eql( [] );
		} );

		it( 'should insert a new URL when followed', () => {
			const original = [ 'http://discover.wordpress.com', 'http://dailypost.wordpress.com' ];
			const state = items( original, {
				type: READER_FOLLOW,
				url: 'http://data.blog'
			} );
			expect( state[ 2 ] ).to.eql( 'http://data.blog' );
		} );

		it( 'should remove a URL when unfollowed', () => {
			const original = [ 'http://discover.wordpress.com', 'http://dailypost.wordpress.com' ];
			const state = items( original, {
				type: READER_UNFOLLOW,
				url: 'http://discover.wordpress.com'
			} );
			expect( state ).to.eql( [ 'http://dailypost.wordpress.com' ] );
		} );
	} );
} );
