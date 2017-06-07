/**
 * External Dependencies
 */

/**
 * Internal Dependencies
 */
import { SITES_BLOG_STICKER_ADD } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';

export function requestBlogStickerAdd( { dispatch }, action ) {
	dispatch(
		http( {
			method: 'POST',
			path: `/site/${ action.payload.siteId }/blog-stickers/add/${ action.payload.stickerName }`,
			body: {}, // have to have an empty body to make wpcom-http happy
			apiVersion: '1.1',
			onSuccess: action,
			onFailure: action,
		} )
	);
}

export default {
	[ SITES_BLOG_STICKER_ADD ]: [
		dispatchRequest(
			requestBlogStickerAdd,
		),
	],
};
