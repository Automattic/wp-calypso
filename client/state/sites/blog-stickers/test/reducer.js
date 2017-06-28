/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { items } from '../reducer';
import { SITES_BLOG_STICKER_LIST_RECEIVE } from 'state/action-types';

describe( 'reducer', () => {
	describe( 'items', () => {
		it( 'should return an empty list by default', () => {
			expect( items( undefined, {} ) ).to.deep.equal( {} );
		} );

		it( 'should append a single sticker when received', () => {
			expect(
				items(
					{},
					{
						type: SITES_BLOG_STICKER_LIST_RECEIVE,
						payload: { blogId: 123, stickers: [ 'dont-recommend' ] },
					}
				)
			).to.deep.equal( { 123: [ 'dont-recommend' ] } );
		} );

		it( 'should append multiple stickers when received', () => {
			expect(
				items(
					{ 123: [ 'dont-recommend' ] },
					{
						type: SITES_BLOG_STICKER_LIST_RECEIVE,
						payload: { blogId: 456, stickers: [ 'dont-recommend', 'broken-in-reader' ] },
					}
				)
			).to.deep.equal(
				{ 123: [ 'dont-recommend' ], 456: [ 'dont-recommend', 'broken-in-reader' ] },

			);
		} );
	} );
} );
