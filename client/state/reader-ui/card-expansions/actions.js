/**
 * Internal dependencies
 */
import {
	READER_EXPAND_CARD,
	READER_RESET_CARD_EXPANSIONS,
} from 'calypso/state/reader/action-types';
import { markPostSeen } from 'calypso/state/reader/posts/actions';
import { reduxDispatch } from 'calypso/lib/redux-bridge';
import DISPLAY_TYPES from 'calypso/state/reader/posts/display-types';
import * as stats from 'calypso/reader/stats';

import 'calypso/state/reader-ui/init';

export const expandCard = ( { postKey, post, site } ) => {
	if ( post.display_type & DISPLAY_TYPES.PHOTO_ONLY ) {
		stats.recordTrackForPost( 'calypso_reader_photo_expanded', post );
	} else if ( post.display_type & DISPLAY_TYPES.FEATURED_VIDEO ) {
		stats.recordTrackForPost( 'calypso_reader_video_expanded', post );
	}
	stats.recordTrackForPost( 'calypso_reader_article_opened', post );

	// Record page view
	reduxDispatch( markPostSeen( post, site ) );
	return {
		type: READER_EXPAND_CARD,
		payload: { postKey },
	};
};

export const resetCardExpansions = () => ( {
	type: READER_RESET_CARD_EXPANSIONS,
} );
