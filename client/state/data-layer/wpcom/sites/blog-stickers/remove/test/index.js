/**
 * External Dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal Dependencies
 */
import {
	requestBlogStickerRemove,
	receiveBlogStickerRemove,
	receiveBlogStickerRemoveError,
} from '../';
import { addBlogSticker, removeBlogSticker } from 'state/sites/blog-stickers/actions';
import { http } from 'state/data-layer/wpcom-http/actions';

describe( 'blog-sticker-remove', () => {
	describe( 'requestBlogStickerRemove', () => {
		it( 'should dispatch an http request and call through next', () => {
			const dispatch = spy();
			const action = removeBlogSticker( 123, 'broken-in-reader' );
			requestBlogStickerRemove( { dispatch }, action );
			expect( dispatch ).to.have.been.calledWith(
				http( {
					method: 'POST',
					path: '/sites/123/blog-stickers/remove/broken-in-reader',
					body: {},
					apiVersion: '1.1',
					onSuccess: action,
					onFailure: action,
				} )
			);
		} );
	} );

	describe( 'receiveBlogStickerRemove', () => {
		it( 'should dispatch a success notice', () => {
			const dispatch = spy();
			const nextSpy = spy();
			receiveBlogStickerRemove(
				{ dispatch },
				{ payload: { blogId: 123, stickerName: 'broken-in-reader' } },
				nextSpy,
				{ success: true }
			);
			expect( dispatch ).to.have.been.calledWithMatch( {
				notice: {
					status: 'is-success',
				},
			} );
			expect( nextSpy ).to.not.have.been.called;
		} );

		it( 'should dispatch a sticker removal if it fails using next', () => {
			const nextSpy = spy();
			const dispatch = spy();
			receiveBlogStickerRemove(
				{ dispatch },
				{ payload: { blogId: 123, stickerName: 'broken-in-reader' } },
				nextSpy,
				{
					success: false,
				}
			);
			expect( nextSpy ).to.have.been.calledWith( addBlogSticker( 123, 'broken-in-reader' ) );
			expect( dispatch ).to.have.been.calledWithMatch( {
				notice: {
					status: 'is-error',
				},
			} );
		} );
	} );

	describe( 'receiveBlogStickerRemoveError', () => {
		it( 'should dispatch an error notice and add sticker action using next', () => {
			const dispatch = spy();
			const nextSpy = spy();
			receiveBlogStickerRemoveError(
				{ dispatch },
				{ payload: { blogId: 123, stickerName: 'broken-in-reader' } },
				nextSpy
			);
			expect( dispatch ).to.have.been.calledWithMatch( {
				notice: {
					status: 'is-error',
				},
			} );
			expect( nextSpy ).to.have.been.calledWith( addBlogSticker( 123, 'broken-in-reader' ) );
		} );
	} );
} );
