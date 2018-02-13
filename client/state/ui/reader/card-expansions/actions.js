/** @format */
/**
 * Internal dependencies
 */
import { markSeen } from 'lib/feed-post-store/actions';
import {
	READER_EXPAND_CARD,
	READER_SHRINK_CARD,
	READER_RESET_CARD_EXPANSIONS,
} from 'state/action-types';
import DISPLAY_TYPES from 'state/reader/posts/display-types';
import * as stats from 'reader/stats';

export const expandCard = ( { postKey, post, site } ) => {
	if ( post.display_type & DISPLAY_TYPES.PHOTO_ONLY ) {
		stats.recordTrackForPost( 'calypso_reader_photo_expanded', post );
	} else if ( post.display_type & DISPLAY_TYPES.FEATURED_VIDEO ) {
		stats.recordTrackForPost( 'calypso_reader_video_expanded', post );
	}
	stats.recordTrackForPost( 'calypso_reader_article_opened', post );

	// Record page view
	markSeen( post, site );
	return {
		type: READER_EXPAND_CARD,
		payload: { postKey },
	};
};

export const shrinkCard = ( { postKey, post } ) => {
	if ( post.display_type & DISPLAY_TYPES.PHOTO_ONLY ) {
		stats.recordTrackForPost( 'calypso_reader_photo_shrunk', post );
	}

	return {
		type: READER_SHRINK_CARD,
		payload: { postKey },
	};
};

export const resetCardExpansions = () => ( {
	type: READER_RESET_CARD_EXPANSIONS,
} );
