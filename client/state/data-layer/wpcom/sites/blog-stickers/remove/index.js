/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import { SITES_BLOG_STICKER_REMOVE } from 'state/action-types';
import { bypassDataLayer } from 'state/data-layer/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice, plainNotice } from 'state/notices/actions';
import { addBlogSticker } from 'state/sites/blog-stickers/actions';

export function requestBlogStickerRemove( { dispatch }, action ) {
	dispatch(
		http( {
			method: 'POST',
			path: `/sites/${ action.payload.blogId }/blog-stickers/remove/${ action.payload.stickerName }`,
			body: {}, // have to have an empty body to make wpcom-http happy
			apiVersion: '1.1',
			onSuccess: action,
			onFailure: action,
		} ),
	);
}

export function receiveBlogStickerRemove( store, action, response ) {
	// validate that it worked
	const isRemoved = !! ( response && response.success );
	if ( ! isRemoved ) {
		receiveBlogStickerRemoveError( store, action );
		return;
	}

	store.dispatch(
		plainNotice(
			translate( 'The sticker {{i}}%s{{/i}} has been removed.', {
				args: action.payload.stickerName,
				components: {
					i: <i />,
				},
			} ),
			{
				duration: 5000,
			},
		),
	);
}

export function receiveBlogStickerRemoveError( { dispatch }, action ) {
	dispatch(
		errorNotice( translate( 'Sorry, we had a problem removing that sticker. Please try again.' ) ),
	);
	// Revert the removal
	dispatch( bypassDataLayer( addBlogSticker( action.payload.blogId, action.payload.stickerName ) ) );
}

export default {
	[ SITES_BLOG_STICKER_REMOVE ]: [
		dispatchRequest(
			requestBlogStickerRemove,
			receiveBlogStickerRemove,
			receiveBlogStickerRemoveError,
		),
	],
};
