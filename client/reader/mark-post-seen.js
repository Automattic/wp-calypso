import { get } from 'lodash';
import { bumpStat } from 'calypso/lib/analytics/mc';
import { pageViewForPost } from 'calypso/reader/stats';

const seenPostGlobalIds = new Set();

export const resetSeenPostGlobalIdsForTests = () => {
	if ( process.env.NODE_ENV === 'test' ) {
		seenPostGlobalIds.clear();
	}
};

export const markPostSeen = ( post, site ) => {
	if ( ! post || seenPostGlobalIds.has( post.global_ID ) ) {
		return;
	}

	if ( post.global_ID ) {
		seenPostGlobalIds.add( post.global_ID );
	}

	if ( post.site_ID ) {
		const isAdmin = !! get( site, 'capabilities.manage_options', false );
		if ( site && site.ID ) {
			if ( site.is_private || ! isAdmin ) {
				pageViewForPost( site.ID, site.URL, post.ID, site.is_private );
				bumpStat( 'reader_pageviews', site.is_private ? 'private_view' : 'public_view' );
			}
		}
	}
};
