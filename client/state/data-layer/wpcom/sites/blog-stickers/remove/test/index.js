/**
 * Internal dependencies
 */
import {
	requestBlogStickerRemove,
	receiveBlogStickerRemove,
	receiveBlogStickerRemoveError,
	fromApi,
} from '../';
import { bypassDataLayer } from 'calypso/state/data-layer/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { addBlogSticker, removeBlogSticker } from 'calypso/state/sites/blog-stickers/actions';

describe( 'blog-sticker-remove', () => {
	describe( 'requestBlogStickerRemove', () => {
		test( 'should dispatch a http request', () => {
			const action = removeBlogSticker( 123, 'broken-in-reader' );
			const output = requestBlogStickerRemove( action );
			expect( output ).toEqual(
				http(
					{
						method: 'POST',
						path: '/sites/123/blog-stickers/remove/broken-in-reader',
						body: {},
						apiVersion: '1.1',
					},
					action
				)
			);
		} );
	} );

	describe( 'receiveBlogStickerRemove', () => {
		test( 'should dispatch a notice', () => {
			const output = receiveBlogStickerRemove( {
				payload: { blogId: 123, stickerName: 'broken-in-reader' },
			} );

			expect( output ).toEqual(
				expect.objectContaining( {
					notice: expect.objectContaining( {
						status: 'is-plain',
					} ),
				} )
			);
		} );
	} );

	describe( 'receiveBlogStickerRemoveError', () => {
		test( 'should dispatch an error notice and add sticker action', () => {
			const output = receiveBlogStickerRemoveError( {
				payload: { blogId: 123, stickerName: 'broken-in-reader' },
			} );

			expect( output[ 0 ] ).toEqual(
				expect.objectContaining( {
					notice: expect.objectContaining( {
						status: 'is-error',
					} ),
				} )
			);

			expect( output[ 1 ] ).toEqual( bypassDataLayer( addBlogSticker( 123, 'broken-in-reader' ) ) );
		} );
	} );

	describe( 'fromApi', () => {
		it( 'should throw an error for an unsuccessful removal', () => {
			expect( () => fromApi( { success: false } ) ).toThrow();
		} );
		it( 'should return original response for a successful removal', () => {
			expect( fromApi( { success: true } ) ).toEqual( { success: true } );
		} );
	} );
} );
