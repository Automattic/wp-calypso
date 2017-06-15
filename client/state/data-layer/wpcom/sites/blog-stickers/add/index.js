/**
 * External Dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { SITES_BLOG_STICKER_ADD } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { removeBlogSticker } from 'state/sites/blog-stickers/actions';
import { errorNotice } from 'state/notices/actions';

export function requestBlogStickerAdd( { dispatch }, action ) {
	dispatch(
		http( {
			method: 'POST',
			path: `/sites/${ action.payload.blogId }/blog-stickers/add/${ action.payload.stickerName }`,
			body: {}, // have to have an empty body to make wpcom-http happy
			apiVersion: '1.1',
			onSuccess: action,
			onFailure: action,
		} ),
	);
}

export function receiveBlogStickerAdd( store, action, next, response ) {
	// validate that it worked
	const isAdded = !! ( response && response.success );
	if ( ! isAdded ) {
		receiveBlogStickerAddError( store, action, next );
		return;
	}
}

export function receiveBlogStickerAddError( { dispatch }, action, next ) {
	dispatch(
		errorNotice( translate( 'Sorry, we had a problem adding that sticker. Please try again.' ) ),
	);
	next( removeBlogSticker( action.payload.blogId, action.payload.stickerName ) );
}

export default {
	[ SITES_BLOG_STICKER_ADD ]: [
		dispatchRequest( requestBlogStickerAdd, receiveBlogStickerAdd, receiveBlogStickerAddError ),
	],
};
