/** @format */
/**
 * External Dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal Dependencies
 */
import { requestBlogStickerList, receiveBlogStickerListError } from '../';
import { listBlogStickers } from 'state/sites/blog-stickers/actions';
import { http } from 'state/data-layer/wpcom-http/actions';

describe( 'blog-sticker-list', () => {
	describe( 'requestBlogStickerList', () => {
		it( 'should dispatch an http request and call through next', () => {
			const dispatch = spy();
			const action = listBlogStickers( 123 );
			requestBlogStickerList( { dispatch }, action );
			expect( dispatch ).to.have.been.calledWith(
				http( {
					method: 'GET',
					path: '/sites/123/blog-stickers',
					body: {},
					apiVersion: '1.1',
					onSuccess: action,
					onFailure: action,
				} )
			);
		} );
	} );

	describe( 'receiveBlogStickerListError', () => {
		it( 'should dispatch an error notice', () => {
			const dispatch = spy();
			receiveBlogStickerListError( { dispatch }, { payload: { blogId: 123 } } );
			expect( dispatch ).to.have.been.calledWithMatch( {
				notice: {
					text: 'Sorry, we had a problem retrieving blog stickers. Please try again.',
				},
			} );
		} );
	} );
} );
