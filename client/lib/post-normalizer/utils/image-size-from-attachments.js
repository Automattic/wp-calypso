import { find } from 'lodash';

/**
 * Looks up the dimensions of an image URL within a post's attachments list.
 *
 * @param {Object} post - The post object, optionally containing an `attachments` map.
 * @param {Object} [post.attachments] - A map of attachment objects keyed by attachment ID.
 * @param {string} imageUrl - The URL of the image to look up.
 * @returns {{ width: number, height: number }|undefined} An object with `width` and `height`
 *   if a matching attachment is found, or `undefined` if the post has no attachments or no
 *   attachment matches the given URL.
 */
export function imageSizeFromAttachments( post, imageUrl ) {
	if ( ! post.attachments ) {
		return;
	}

	const found = find( post.attachments, ( attachment ) => attachment.URL === imageUrl );

	if ( found ) {
		return {
			width: found.width,
			height: found.height,
		};
	}
}
