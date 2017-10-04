/** @format */
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
import { bypassDataLayer } from 'state/data-layer/utils';

describe( 'blog-sticker-remove', () => {
	describe( 'requestBlogStickerRemove', () => {
		it( 'should dispatch an http request', () => {
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
		it( 'should dispatch a notice', () => {
			const dispatch = spy();
			receiveBlogStickerRemove(
				{ dispatch },
				{ payload: { blogId: 123, stickerName: 'broken-in-reader' } },
				{ success: true }
			);
			expect( dispatch ).to.have.been.calledWithMatch( {
				notice: {
					status: 'is-plain',
				},
			} );
		} );

		it( 'should dispatch a sticker removal if it fails', () => {
			const dispatch = spy();
			receiveBlogStickerRemove(
				{ dispatch },
				{ payload: { blogId: 123, stickerName: 'broken-in-reader' } },
				{
					success: false,
				}
			);
			expect( dispatch ).to.have.been.calledWithMatch( {
				notice: {
					status: 'is-error',
				},
			} );
		} );
	} );

	describe( 'receiveBlogStickerRemoveError', () => {
		it( 'should dispatch an error notice and add sticker action', () => {
			const dispatch = spy();
			receiveBlogStickerRemoveError(
				{ dispatch },
				{ payload: { blogId: 123, stickerName: 'broken-in-reader' } }
			);
			expect( dispatch ).to.have.been.calledWithMatch( {
				notice: {
					status: 'is-error',
				},
			} );
			expect( dispatch ).to.have.been.calledWith(
				bypassDataLayer( addBlogSticker( 123, 'broken-in-reader' ) )
			);
		} );
	} );
} );
