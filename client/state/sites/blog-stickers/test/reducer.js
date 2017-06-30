/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { items } from '../reducer';
import { SITES_BLOG_STICKER_LIST_RECEIVE, SITES_BLOG_STICKER_ADD } from 'state/action-types';

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
					},
				),
			).to.deep.equal( { 123: [ 'dont-recommend' ] } );
		} );

		it( 'should append multiple stickers when received', () => {
			expect(
				items(
					{ 123: [ 'dont-recommend' ] },
					{
						type: SITES_BLOG_STICKER_LIST_RECEIVE,
						payload: { blogId: 456, stickers: [ 'dont-recommend', 'broken-in-reader' ] },
					},
				),
			).to.deep.equal( {
				123: [ 'dont-recommend' ],
				456: [ 'dont-recommend', 'broken-in-reader' ],
			} );
		} );

		it( 'should replace existing stickers for a blog when received', () => {
			expect(
				items(
					{ 123: [ 'dont-recommend' ] },
					{
						type: SITES_BLOG_STICKER_LIST_RECEIVE,
						payload: { blogId: 123, stickers: [ 'okapi-friendly', 'broken-in-reader' ] },
					},
				),
			).to.deep.equal( { 123: [ 'okapi-friendly', 'broken-in-reader' ] } );
		} );

		it( 'should add a new sticker to a blog we do not yet have stickers for', () => {
			expect(
				items(
					{ 456: [ 'dont-recommend' ] },
					{
						type: SITES_BLOG_STICKER_ADD,
						payload: { blogId: 123, stickerName: 'okapi-friendly' },
					},
				),
			).to.deep.equal( { 123: [ 'okapi-friendly' ], 456: [ 'dont-recommend' ] } );
		} );

		it( 'should add a new sticker to a blog we already have stickers for', () => {
			expect(
				items(
					{ 123: [ 'dont-recommend' ] },
					{
						type: SITES_BLOG_STICKER_ADD,
						payload: { blogId: 123, stickerName: 'okapi-friendly' },
					},
				)[ 123 ],
			).to.have.members( [ 'okapi-friendly', 'dont-recommend' ] );
		} );

		it( 'should not add a duplicate sticker', () => {
			expect(
				items(
					{ 123: [ 'dont-recommend' ] },
					{
						type: SITES_BLOG_STICKER_ADD,
						payload: { blogId: 123, stickerName: 'dont-recommend' },
					},
				),
			).to.deep.equal( { 123: [ 'dont-recommend' ] } );
		} );
	} );
} );
