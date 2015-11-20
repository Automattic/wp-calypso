// Internal dependencies
import DiscoverHelper from 'reader/discover/helper';

export default {
	shouldShowLikes( post ) {
		let showLikes = false;
		const isDiscoverPost = DiscoverHelper.isDiscoverPost( post );
		if ( isDiscoverPost ) {
			if ( DiscoverHelper.isInternalDiscoverPost( post ) && ! DiscoverHelper.isDiscoverSitePick( post ) ) {
				showLikes = true;
			}
		} else if ( post && post.site_ID && ! post.is_external ) {
			showLikes = true;
		}

		return showLikes;
	}
};
