/**
 * Internal dependencies
 */
import {
	isDiscoverPost,
	isInternalDiscoverPost,
	isDiscoverSitePick,
} from 'calypso/reader/discover/helper';

export function shouldShowLikes( post ) {
	let showLikes = false;
	if ( isDiscoverPost( post ) ) {
		if ( isInternalDiscoverPost( post ) && ! isDiscoverSitePick( post ) ) {
			showLikes = true;
		}
	} else if ( post && post.site_ID && ! post.is_external ) {
		showLikes = true;
	}

	return showLikes;
}
