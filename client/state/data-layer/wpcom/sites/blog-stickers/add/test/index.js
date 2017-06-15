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

describe( 'blog-stickers', () => {
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
				} ),
			);
		} );
	} );

	describe( 'receiveBlogStickerAdd', () => {
		it( 'should do nothing if successful', () => {
			const nextSpy = spy();
			receiveBlogStickerAdd( null, null, nextSpy, { success: true } );
			expect( nextSpy ).to.not.have.been.called;
		} );

		it( 'should dispatch a sticker removal if it fails using next', () => {
			const nextSpy = spy();
			const dispatch = spy();
			receiveBlogStickerAdd(
				{ dispatch },
				{ payload: { blogId: 123, stickerName: 'broken-in-reader' } },
				nextSpy,
				{
					success: false,
				},
			);
			expect( nextSpy ).to.have.been.calledWith( removeBlogSticker( 123, 'broken-in-reader' ) );
			expect( dispatch ).to.have.been.calledWithMatch( {
				notice: {
					text: 'Sorry, we had a problem adding that sticker. Please try again.',
				},
			} );
		} );
	} );

	describe( 'receiveBlogStickerAddError', () => {
		it( 'should dispatch an error notice and remove sticker action using next', () => {
			const dispatch = spy();
			const nextSpy = spy();
			receiveBlogStickerAddError(
				{ dispatch },
				{ payload: { blogId: 123, stickerName: 'broken-in-reader' } },
				nextSpy,
			);
			expect( dispatch ).to.have.been.calledWithMatch( {
				notice: {
					text: 'Sorry, we had a problem adding that sticker. Please try again.',
				},
			} );
			expect( nextSpy ).to.have.been.calledWith( removeBlogSticker( 123, 'broken-in-reader' ) );
		} );
	} );
} );
