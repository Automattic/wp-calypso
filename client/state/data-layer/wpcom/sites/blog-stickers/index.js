/**
 * External dependencies
 */

import { translate } from 'i18n-calypso';
import { isArray } from 'lodash';

/**
 * Internal Dependencies
 */
import { SITES_BLOG_STICKER_LIST } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
import { receiveBlogStickers } from 'state/sites/blog-stickers/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const requestBlogStickerList = ( action ) =>
	http(
		{
			method: 'GET',
			path: `/sites/${ action.payload.blogId }/blog-stickers`,
			body: {}, // have to have an empty body to make wpcom-http happy
			apiVersion: '1.1',
		},
		action
	);

export const receiveBlogStickerListError = () =>
	errorNotice( translate( 'Sorry, we had a problem retrieving blog stickers. Please try again.' ) );

export const receiveBlogStickerList = ( action, response ) =>
	! response || ! isArray( response )
		? receiveBlogStickerListError( action )
		: receiveBlogStickers( action.payload.blogId, response );

registerHandlers( 'state/data-layer/wpcom/sites/blog-stickers/index.js', {
	[ SITES_BLOG_STICKER_LIST ]: [
		dispatchRequest( {
			fetch: requestBlogStickerList,
			onSuccess: receiveBlogStickerList,
			onError: receiveBlogStickerListError,
		} ),
	],
} );
