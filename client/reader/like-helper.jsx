import {
	isDiscoverPost,
	isInternalDiscoverPost,
	isDiscoverSitePick,
} from 'calypso/reader/discover/helper';

/**
 * True if likes are explicitly disabled.
 * False if likes are enabled or the property does not exist.
 *
 * @param {object} post
 * @returns {boolean} True if likes are explicitly disabled
 */
function isLikesDisabled( post ) {
	return post?.likes_enabled === false;
}

export function shouldShowLikes( post ) {
	let showLikes = false;
	if ( isDiscoverPost( post ) ) {
		if (
			isInternalDiscoverPost( post ) &&
			! isDiscoverSitePick( post ) &&
			! isLikesDisabled( post )
		) {
			showLikes = true;
		}
	} else if ( post && post.site_ID && ! post.is_external && ! isLikesDisabled( post ) ) {
		showLikes = true;
	}

	return showLikes;
}
