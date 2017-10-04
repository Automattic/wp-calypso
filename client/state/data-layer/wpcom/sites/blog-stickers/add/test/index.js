/** @format */
/**
 * External Dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal Dependencies
 */
import { requestBlogStickerAdd, receiveBlogStickerAdd, receiveBlogStickerAddError } from '../';
import { addBlogSticker, removeBlogSticker } from 'state/sites/blog-stickers/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { bypassDataLayer } from 'state/data-layer/utils';

describe( 'blog-sticker-add', () => {
	describe( 'requestBlogStickerAdd', () => {
		it( 'should dispatch an http request and call through next', () => {
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
		it( 'should dispatch a success notice', () => {
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

		it( 'should dispatch a sticker removal if it fails using next', () => {
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
		it( 'should dispatch an error notice and remove sticker action using next', () => {
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
