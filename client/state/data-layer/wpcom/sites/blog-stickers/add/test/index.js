/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { requestBlogStickerAdd, receiveBlogStickerAdd, receiveBlogStickerAddError } from '../';
import { bypassDataLayer } from 'client/state/data-layer/utils';
import { http } from 'client/state/data-layer/wpcom-http/actions';
import { addBlogSticker, removeBlogSticker } from 'client/state/sites/blog-stickers/actions';

describe( 'blog-sticker-add', () => {
	describe( 'requestBlogStickerAdd', () => {
		test( 'should dispatch an http request and call through next', () => {
			const dispatch = spy();
			const action = addBlogSticker( 123, 'broken-in-reader' );
			requestBlogStickerAdd( { dispatch }, action );
			expect( dispatch ).to.have.been.calledWith(
				http( {
					method: 'POST',
					path: '/sites/123/blog-stickers/add/broken-in-reader',
					body: {},
					apiVersion: '1.1',
					onSuccess: action,
					onFailure: action,
				} )
			);
		} );
	} );

	describe( 'receiveBlogStickerAdd', () => {
		test( 'should dispatch a success notice', () => {
			const dispatch = spy();
			receiveBlogStickerAdd(
				{ dispatch },
				{ payload: { blogId: 123, stickerName: 'broken-in-reader' } },
				{ success: true }
			);
			expect( dispatch ).to.have.been.calledWithMatch( {
				notice: {
					status: 'is-success',
				},
			} );
		} );

		test( 'should dispatch a sticker removal if it fails using next', () => {
			const dispatch = spy();
			receiveBlogStickerAdd(
				{ dispatch },
				{ payload: { blogId: 123, stickerName: 'broken-in-reader' } },
				{
					success: false,
				}
			);
			expect( dispatch ).to.have.been.calledWith(
				bypassDataLayer( removeBlogSticker( 123, 'broken-in-reader' ) )
			);
			expect( dispatch ).to.have.been.calledWithMatch( {
				notice: {
					status: 'is-error',
				},
			} );
		} );
	} );

	describe( 'receiveBlogStickerAddError', () => {
		test( 'should dispatch an error notice and remove sticker action using next', () => {
			const dispatch = spy();
			receiveBlogStickerAddError(
				{ dispatch },
				{ payload: { blogId: 123, stickerName: 'broken-in-reader' } }
			);
			expect( dispatch ).to.have.been.calledWithMatch( {
				notice: {
					status: 'is-error',
				},
			} );
			expect( dispatch ).to.have.been.calledWith(
				bypassDataLayer( removeBlogSticker( 123, 'broken-in-reader' ) )
			);
		} );
	} );
} );
