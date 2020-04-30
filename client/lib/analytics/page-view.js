// pageView is a wrapper for pageview events across Tracks and GA.

/**
 * Internal dependencies
 */
import { saveCouponQueryArgument } from 'lib/analytics/utils';

import { retarget as retargetAdTrackers } from 'lib/analytics/ad-tracking';
import { updateQueryParamsTracking } from 'lib/analytics/sem';
import { gaRecordPageView } from './ga';
import { processQueue } from './queue';
import { referRecordPageView } from './refer';
import { recordTracksPageViewWithPageParams } from '@automattic/calypso-analytics';

export function recordPageView( urlPath, pageTitle, params = {} ) {
	// Add delay to avoid stale `_dl` in recorded calypso_page_view event details.
	// `_dl` (browserdocumentlocation) is read from the current URL by external JavaScript.
	setTimeout( () => {
		// Tracks, Google Analytics, Refer platform.
		recordTracksPageViewWithPageParams( urlPath, params );
		gaRecordPageView( urlPath, pageTitle );
		referRecordPageView();

		// Retargeting.
		saveCouponQueryArgument();
		updateQueryParamsTracking();
		retargetAdTrackers( urlPath );

		// Process queue.
		processQueue();
	}, 0 );
}
