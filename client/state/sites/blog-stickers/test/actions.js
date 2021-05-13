/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	SITES_BLOG_STICKER_ADD,
	SITES_BLOG_STICKER_REMOVE,
	SITES_BLOG_STICKER_LIST,
	SITES_BLOG_STICKER_LIST_RECEIVE,
} from 'calypso/state/action-types';
import {
	addBlogSticker,
	removeBlogSticker,
	listBlogStickers,
	receiveBlogStickers,
} from 'calypso/state/sites/blog-stickers/actions';

describe( 'actions', () => {
	describe( '#addBlogSticker', () => {
		test( 'should return an action when a blog sticker is added', () => {
			const action = addBlogSticker( 123, 'broken-in-reader' );
			expect( action ).to.deep.equal( {
				type: SITES_BLOG_STICKER_ADD,
				payload: { blogId: 123, stickerName: 'broken-in-reader' },
			} );
		} );
	} );

	describe( '#removeBlogSticker', () => {
		test( 'should return an action when a blog sticker is removed', () => {
			const action = removeBlogSticker( 123, 'broken-in-reader' );
			expect( action ).to.deep.equal( {
				type: SITES_BLOG_STICKER_REMOVE,
				payload: { blogId: 123, stickerName: 'broken-in-reader' },
			} );
		} );
	} );

	describe( '#listBlogStickers', () => {
		test( 'should return an action when a blog sticker list is requested', () => {
			const action = listBlogStickers( 123 );
			expect( action ).to.deep.equal( {
				type: SITES_BLOG_STICKER_LIST,
				payload: { blogId: 123 },
			} );
		} );
	} );

	describe( '#receiveBlogStickers', () => {
		test( 'should return an action when a blog sticker list is received', () => {
			const action = receiveBlogStickers( 123, [ 'dont-recommend' ] );
			expect( action ).to.deep.equal( {
				type: SITES_BLOG_STICKER_LIST_RECEIVE,
				payload: { blogId: 123, stickers: [ 'dont-recommend' ] },
			} );
		} );
	} );
} );
