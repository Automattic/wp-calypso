/**
 * External Dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { SITES_BLOG_STICKER_REMOVE } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { addBlogSticker } from 'state/sites/blog-stickers/actions';
import { errorNotice, successNotice } from 'state/notices/actions';

export function requestBlogStickerRemove( { dispatch }, action ) {
	dispatch(
		http( {
			method: 'POST',
			path: `/sites/${ action.payload.blogId }/blog-stickers/remove/${ action.payload.stickerName }`,
			body: {}, // have to have an empty body to make wpcom-http happy
			apiVersion: '1.1',
			onSuccess: action,
			onFailure: action,
		} )
	);
}

export function receiveBlogStickerRemove( store, action, next, response ) {
	// validate that it worked
	const isRemoved = !! ( response && response.success );
	if ( ! isRemoved ) {
		receiveBlogStickerRemoveError( store, action, next );
		return;
	}

	store.dispatch(
		successNotice(
			translate( 'The sticker {{i}}%s{{/i}} has been successfully removed.', {
				args: action.payload.stickerName,
				components: {
					i: <i />,
				},
			} )
		)
	);
}

export function receiveBlogStickerRemoveError( { dispatch }, action, next ) {
	dispatch(
		errorNotice( translate( 'Sorry, we had a problem removing that sticker. Please try again.' ) )
	);
	// Revert the removal
	next( addBlogSticker( action.payload.blogId, action.payload.stickerName ) );
}

export default {
	[ SITES_BLOG_STICKER_REMOVE ]: [
		dispatchRequest(
			requestBlogStickerRemove,
			receiveBlogStickerRemove,
			receiveBlogStickerRemoveError
		),
	],
};
