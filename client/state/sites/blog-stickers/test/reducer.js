/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { items } from '../reducer';
import {
	SITES_BLOG_STICKER_LIST_RECEIVE,
	SITES_BLOG_STICKER_ADD,
	SITES_BLOG_STICKER_REMOVE,
} from 'calypso/state/action-types';

describe( 'reducer', () => {
	describe( 'items', () => {
		test( 'should return an empty list by default', () => {
			expect( items( undefined, {} ) ).to.deep.equal( {} );
		} );

		test( 'should append a single sticker when received', () => {
			expect(
				items( deepFreeze( {} ), {
					type: SITES_BLOG_STICKER_LIST_RECEIVE,
					payload: { blogId: 123, stickers: [ 'dont-recommend' ] },
				} )
			).to.deep.equal( { 123: [ 'dont-recommend' ] } );
		} );

		test( 'should append multiple stickers when received', () => {
			expect(
				items( deepFreeze( { 123: [ 'dont-recommend' ] } ), {
					type: SITES_BLOG_STICKER_LIST_RECEIVE,
					payload: { blogId: 456, stickers: [ 'dont-recommend', 'broken-in-reader' ] },
				} )
			).to.deep.equal( {
				123: [ 'dont-recommend' ],
				456: [ 'dont-recommend', 'broken-in-reader' ],
			} );
		} );

		test( 'should replace existing stickers for a blog when received', () => {
			expect(
				items( deepFreeze( { 123: [ 'dont-recommend' ] } ), {
					type: SITES_BLOG_STICKER_LIST_RECEIVE,
					payload: { blogId: 123, stickers: [ 'okapi-friendly', 'broken-in-reader' ] },
				} )
			).to.deep.equal( { 123: [ 'okapi-friendly', 'broken-in-reader' ] } );
		} );

		test( 'should add a new sticker to a blog we do not yet have stickers for', () => {
			expect(
				items( deepFreeze( { 456: [ 'dont-recommend' ] } ), {
					type: SITES_BLOG_STICKER_ADD,
					payload: { blogId: 123, stickerName: 'okapi-friendly' },
				} )
			).to.deep.equal( { 123: [ 'okapi-friendly' ], 456: [ 'dont-recommend' ] } );
		} );

		test( 'should add a new sticker to a blog we already have stickers for', () => {
			expect(
				items( deepFreeze( { 123: [ 'dont-recommend' ] } ), {
					type: SITES_BLOG_STICKER_ADD,
					payload: { blogId: 123, stickerName: 'okapi-friendly' },
				} )[ 123 ]
			).to.have.members( [ 'okapi-friendly', 'dont-recommend' ] );
		} );

		test( 'should not add a duplicate sticker', () => {
			const initialState = deepFreeze( { 123: [ 'dont-recommend' ] } );
			expect(
				items( initialState, {
					type: SITES_BLOG_STICKER_ADD,
					payload: { blogId: 123, stickerName: 'dont-recommend' },
				} )
			).to.deep.equal( initialState );
		} );

		test( 'should remove a sticker', () => {
			expect(
				items( deepFreeze( { 123: [ 'dont-recommend' ] } ), {
					type: SITES_BLOG_STICKER_REMOVE,
					payload: { blogId: 123, stickerName: 'dont-recommend' },
				} )
			).to.deep.equal( { 123: [] } );
		} );

		test( 'should not remove any stickers if the blog does not have that sticker', () => {
			const initialState = deepFreeze( { 123: [ 'okapi-friendly' ] } );
			expect(
				items( initialState, {
					type: SITES_BLOG_STICKER_REMOVE,
					payload: { blogId: 123, stickerName: 'dont-recommend' },
				} )
			).to.equal( initialState );
		} );
	} );
} );
