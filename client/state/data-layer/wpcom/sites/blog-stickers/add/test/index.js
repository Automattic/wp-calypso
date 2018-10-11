/** @format */

/**
 * Internal dependencies
 */
import {
	requestBlogStickerAdd,
	receiveBlogStickerAdd,
	receiveBlogStickerAddError,
	fromApi,
} from '../';
import { bypassDataLayer } from 'state/data-layer/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { addBlogSticker, removeBlogSticker } from 'state/sites/blog-stickers/actions';

describe( 'blog-sticker-add', () => {
	describe( 'requestBlogStickerAdd', () => {
		test( 'should dispatch a http request', () => {
			const action = addBlogSticker( 123, 'broken-in-reader' );

			expect( requestBlogStickerAdd( action ) ).toEqual(
				http(
					{
						method: 'POST',
						path: '/sites/123/blog-stickers/add/broken-in-reader',
						body: {},
						apiVersion: '1.1',
					},
					action
				)
			);
		} );
	} );

	describe( 'receiveBlogStickerAdd', () => {
		test( 'should dispatch a success notice by default', () => {
			const output = receiveBlogStickerAdd( {
				payload: { blogId: 123, stickerName: 'broken-in-reader', withNotice: true },
			} );
			expect( output ).toEqual(
				expect.objectContaining( {
					notice: expect.objectContaining( {
						status: 'is-success',
					} ),
				} )
			);
		} );

		test( 'should not dispatch a success notice if withNotice is false', () => {
			const output = receiveBlogStickerAdd( {
				payload: { blogId: 123, stickerName: 'broken-in-reader', withNotice: false },
			} );
			expect( output ).toBeUndefined();
		} );
	} );

	describe( 'receiveBlogStickerAddError', () => {
		test( 'should revert to the previous state', () => {
			const output = receiveBlogStickerAddError(
				{ payload: { blogId: 123, stickerName: 'broken-in-reader', withNotice: true } },
				{
					success: false,
				}
			);

			expect( output[ 0 ] ).toEqual(
				bypassDataLayer( removeBlogSticker( 123, 'broken-in-reader' ) )
			);
		} );

		test( 'should dispatch an error notice by default', () => {
			const output = receiveBlogStickerAddError(
				{ payload: { blogId: 123, stickerName: 'broken-in-reader', withNotice: true } },
				{
					success: false,
				}
			);

			expect( output[ 1 ] ).toEqual(
				expect.objectContaining( {
					notice: expect.objectContaining( {
						status: 'is-error',
					} ),
				} )
			);
		} );

		test( 'should not dispatch an error notice if withNotice is false', () => {
			const output = receiveBlogStickerAddError(
				{ payload: { blogId: 123, stickerName: 'broken-in-reader', withNotice: false } },
				{
					success: false,
				}
			);

			expect( output[ 1 ] ).toBeUndefined();
		} );
	} );

	describe( 'fromApi', () => {
		it( 'should throw an error for an unsuccessful add', () => {
			expect( () => fromApi( { success: false } ) ).toThrow();
		} );
		it( 'should return original response for a successful add', () => {
			expect( fromApi( { success: true } ) ).toEqual( { success: true } );
		} );
	} );
} );
