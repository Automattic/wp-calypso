/** @format */

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
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
import addBlogStickerHandler from 'state/data-layer/wpcom/sites/blog-stickers/add';
import removeBlogStickerHandler from 'state/data-layer/wpcom/sites/blog-stickers/remove';
import { mergeHandlers } from 'state/action-watchers/utils';
import { receiveBlogStickers } from 'state/sites/blog-stickers/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const requestBlogStickerList = action =>
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

const listBlogStickersHandler = {
	[ SITES_BLOG_STICKER_LIST ]: [
		dispatchRequestEx( {
			fetch: requestBlogStickerList,
			onSuccess: receiveBlogStickerList,
			onError: receiveBlogStickerListError,
		} ),
	],
};

registerHandlers(
	'state/data-layer/wpcom/sites/blog-stickers/index.js',
	mergeHandlers( listBlogStickersHandler, addBlogStickerHandler, removeBlogStickerHandler )
);

export default {};
