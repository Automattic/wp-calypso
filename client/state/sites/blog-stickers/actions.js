/**
 * Internal dependencies
 */
import { SITES_BLOG_STICKER_ADD, SITES_BLOG_STICKER_REMOVE } from 'state/action-types';

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
