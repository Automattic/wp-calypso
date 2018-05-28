/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { SITES_BLOG_STICKER_REMOVE } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { addBlogSticker } from 'state/sites/blog-stickers/actions';
import { errorNotice, plainNotice } from 'state/notices/actions';
import { bypassDataLayer } from 'state/data-layer/utils';

export const requestBlogStickerRemove = action =>
	http( {
		method: 'POST',
		path: `/sites/${ action.payload.blogId }/blog-stickers/remove/${ action.payload.stickerName }`,
		body: {}, // have to have an empty body to make wpcom-http happy
		apiVersion: '1.1',
		onSuccess: action,
		onFailure: action,
	} );

export const receiveBlogStickerRemoveError = action => [
	errorNotice( translate( 'Sorry, we had a problem removing that sticker. Please try again.' ) ),
	bypassDataLayer( addBlogSticker( action.payload.blogId, action.payload.stickerName ) ),
];

export const receiveBlogStickerRemove = action =>
	plainNotice(
		translate( 'The sticker {{i}}%s{{/i}} has been removed.', {
			args: action.payload.stickerName,
			components: {
				i: <i />,
			},
		} ),
		{
			duration: 5000,
		}
	);

const fromApi = ( { success } ) => {
	if ( ! success ) {
		throw new Error( 'Remove was unsuccessful on the server' );
	}
};

export default {
	[ SITES_BLOG_STICKER_REMOVE ]: [
		dispatchRequestEx( {
			fetch: requestBlogStickerRemove,
			onSuccess: receiveBlogStickerRemove,
			onError: receiveBlogStickerRemoveError,
			fromApi,
		} ),
	],
};
