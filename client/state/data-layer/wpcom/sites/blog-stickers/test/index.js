/**
 * Internal dependencies
 */
import { requestBlogStickerList, receiveBlogStickerListError } from '../';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { listBlogStickers } from 'calypso/state/sites/blog-stickers/actions';

describe( 'blog-sticker-list', () => {
	describe( 'requestBlogStickerList', () => {
		test( 'should dispatch a http request', () => {
			const action = listBlogStickers( 123 );
			const output = requestBlogStickerList( action );
			expect( output ).toEqual(
				http(
					{
						method: 'GET',
						path: '/sites/123/blog-stickers',
						body: {},
						apiVersion: '1.1',
					},
					action
				)
			);
		} );
	} );

	describe( 'receiveBlogStickerListError', () => {
		test( 'should dispatch an error notice', () => {
			const output = receiveBlogStickerListError( { payload: { blogId: 123 } } );
			expect( output ).toEqual(
				expect.objectContaining( {
					notice: expect.objectContaining( {
						status: 'is-error',
					} ),
				} )
			);
		} );
	} );
} );
