/** @format */
/**
 * External Dependencies
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
import addBlogStickerHandler from 'state/data-layer/wpcom/sites/blog-stickers/add';
import removeBlogStickerHandler from 'state/data-layer/wpcom/sites/blog-stickers/remove';
import { mergeHandlers } from 'state/action-watchers/utils';
import { receiveBlogStickers } from 'state/sites/blog-stickers/actions';

export function requestBlogStickerList( { dispatch }, action ) {
	dispatch(
		http( {
			method: 'GET',
			path: `/sites/${ action.payload.blogId }/blog-stickers`,
			body: {}, // have to have an empty body to make wpcom-http happy
			apiVersion: '1.1',
			onSuccess: action,
			onFailure: action,
		} )
	);
}

export function receiveBlogStickerList( store, action, response ) {
	// validate that it worked
	if ( ! response || ! isArray( response ) ) {
		receiveBlogStickerListError( store, action );
		return;
	}

	store.dispatch( receiveBlogStickers( action.payload.blogId, response ) );
}

export function receiveBlogStickerListError( { dispatch } ) {
	dispatch(
		errorNotice(
			translate( 'Sorry, we had a problem retrieving blog stickers. Please try again.' )
		)
	);
}

const listBlogStickersHandler = {
	[ SITES_BLOG_STICKER_LIST ]: [
		dispatchRequest( requestBlogStickerList, receiveBlogStickerList, receiveBlogStickerListError ),
	],
};

export default mergeHandlers(
	listBlogStickersHandler,
	addBlogStickerHandler,
	removeBlogStickerHandler
);
