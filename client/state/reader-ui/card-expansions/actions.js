import * as stats from 'calypso/reader/stats';
import {
	READER_EXPAND_CARD,
	READER_RESET_CARD_EXPANSIONS,
} from 'calypso/state/reader-ui/action-types';
import { markPostSeen } from 'calypso/state/reader/posts/actions';
import DISPLAY_TYPES from 'calypso/state/reader/posts/display-types';

import 'calypso/state/reader-ui/init';

export const expandCard = ( { postKey, post, site } ) => {
	return ( dispatch ) => {
		if ( post.display_type & DISPLAY_TYPES.PHOTO_ONLY ) {
			stats.recordTrackForPost( 'calypso_reader_photo_expanded', post );
		} else if ( post.display_type & DISPLAY_TYPES.FEATURED_VIDEO ) {
			stats.recordTrackForPost( 'calypso_reader_video_expanded', post );
		}
		stats.recordTrackForPost( 'calypso_reader_article_opened', post );

		// Record page view
		dispatch( markPostSeen( post, site ) );
		dispatch( {
			type: READER_EXPAND_CARD,
			payload: { postKey },
		} );
	};
};

export const resetCardExpansions = () => ( {
	type: READER_RESET_CARD_EXPANSIONS,
} );
