/** @format */
// Internal dependencies
import { isDiscoverPost, isInternalDiscoverPost, isDiscoverSitePick } from 'reader/discover/helper';

const exported = {
	shouldShowLikes( post ) {
		let showLikes = false;
		if ( isDiscoverPost( post ) ) {
			if ( isInternalDiscoverPost( post ) && ! isDiscoverSitePick( post ) ) {
				showLikes = true;
			}
		} else if ( post && post.site_ID && ! post.is_external ) {
			showLikes = true;
		}

		return showLikes;
	},
};

export default exported;

export const { shouldShowLikes } = exported;
