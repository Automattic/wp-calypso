// pageView is a wrapper for pageview events across Tracks and GA.

/**
 * Internal dependencies
 */
import { saveCouponQueryArgument } from 'calypso/lib/analytics/utils';

import { retarget as retargetAdTrackers } from 'calypso/lib/analytics/ad-tracking';
import { updateQueryParamsTracking } from 'calypso/lib/analytics/sem';
import { retargetFullStory } from 'calypso/lib/analytics/fullstory';
import { gaRecordPageView } from './ga';
import { processQueue } from './queue';
import { referRecordPageView } from './refer';
import { recordTracksPageViewWithPageParams } from '@automattic/calypso-analytics';

export function recordPageView( urlPath, pageTitle, params = {}, options = {} ) {
	// Add delay to avoid stale `_dl` in recorded calypso_page_view event details.
	// `_dl` (browserdocumentlocation) is read from the current URL by external JavaScript.
	setTimeout( () => {
		// Tracks, Google Analytics, Refer platform.
		recordTracksPageViewWithPageParams( urlPath, params );
		gaRecordPageView( urlPath, pageTitle, options?.useJetpackGoogleAnalytics );
		referRecordPageView();

		// Retargeting.
		saveCouponQueryArgument();
		updateQueryParamsTracking();
		retargetAdTrackers( urlPath );

		// FullStory.
		retargetFullStory();

		// Process queue.
		processQueue();
	}, 0 );
}
