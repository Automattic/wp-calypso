/**
 * External dependencies
 */

import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { SITES_BLOG_STICKER_ADD } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { removeBlogSticker } from 'state/sites/blog-stickers/actions';
import { errorNotice, successNotice } from 'state/notices/actions';
import { bypassDataLayer } from 'state/data-layer/utils';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const requestBlogStickerAdd = ( action ) =>
	http(
		{
			method: 'POST',
			path: `/sites/${ action.payload.blogId }/blog-stickers/add/${ action.payload.stickerName }`,
			body: {}, // have to have an empty body to make wpcom-http happy
			apiVersion: '1.1',
		},
		action
	);

export const receiveBlogStickerAddError = ( action ) => [
	errorNotice( translate( 'Sorry, we had a problem adding that sticker. Please try again.' ) ),
	bypassDataLayer( removeBlogSticker( action.payload.blogId, action.payload.stickerName ) ),
];

export const receiveBlogStickerAdd = ( action ) => {
	return successNotice(
		translate( 'The sticker {{i}}%s{{/i}} has been successfully added.', {
			args: action.payload.stickerName,
			components: {
				i: <i />,
			},
		} ),
		{
			duration: 5000,
		}
	);
};

export function fromApi( response ) {
	if ( ! response.success ) {
		throw new Error( 'Adding blog sticker was unsuccessful', response );
	}
	return response;
}

registerHandlers( 'state/data-layer/wpcom/sites/blog-stickers/add/index.js', {
	[ SITES_BLOG_STICKER_ADD ]: [
		dispatchRequest( {
			fetch: requestBlogStickerAdd,
			onSuccess: receiveBlogStickerAdd,
			onError: receiveBlogStickerAddError,
			fromApi,
		} ),
	],
} );
