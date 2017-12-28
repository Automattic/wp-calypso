/** @format */

/**
 * Internal dependencies
 */

import {
	SITES_BLOG_STICKER_ADD,
	SITES_BLOG_STICKER_REMOVE,
	SITES_BLOG_STICKER_LIST,
	SITES_BLOG_STICKER_LIST_RECEIVE,
} from 'client/state/action-types';

export function addBlogSticker( blogId, stickerName ) {
	return {
		type: SITES_BLOG_STICKER_ADD,
		payload: {
			blogId,
			stickerName,
		},
	};
}

export function removeBlogSticker( blogId, stickerName ) {
	return {
		type: SITES_BLOG_STICKER_REMOVE,
		payload: {
			blogId,
			stickerName,
		},
	};
}

export function listBlogStickers( blogId ) {
	return {
		type: SITES_BLOG_STICKER_LIST,
		payload: {
			blogId,
		},
	};
}

export function receiveBlogStickers( blogId, stickers ) {
	return {
		type: SITES_BLOG_STICKER_LIST_RECEIVE,
		payload: { blogId, stickers },
	};
}
