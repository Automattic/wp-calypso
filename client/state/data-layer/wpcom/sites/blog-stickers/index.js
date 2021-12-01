import { translate } from 'i18n-calypso';
import { SITES_BLOG_STICKER_LIST } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice } from 'calypso/state/notices/actions';
import { receiveBlogStickers } from 'calypso/state/sites/blog-stickers/actions';

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
	! response || ! Array.isArray( response )
		? receiveBlogStickerListError()
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
