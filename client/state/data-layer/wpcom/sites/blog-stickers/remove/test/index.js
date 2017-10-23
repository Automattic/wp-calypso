/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import {
	requestBlogStickerRemove,
	receiveBlogStickerRemove,
	receiveBlogStickerRemoveError,
} from '../';
import { bypassDataLayer } from 'state/data-layer/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { addBlogSticker, removeBlogSticker } from 'state/sites/blog-stickers/actions';

describe( 'blog-sticker-remove', () => {
	describe( 'requestBlogStickerRemove', () => {
		test( 'should dispatch an http request', () => {
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
		test( 'should dispatch a notice', () => {
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

		test( 'should dispatch a sticker removal if it fails', () => {
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
		test( 'should dispatch an error notice and add sticker action', () => {
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
