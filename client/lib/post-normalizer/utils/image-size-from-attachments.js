/**
 * External Dependencies
 */
import { find } from 'lodash';

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
