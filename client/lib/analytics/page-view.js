// pageView is a wrapper for pageview events across Tracks and GA.

import { recordTracksPageViewWithPageParams } from '@automattic/calypso-analytics';
import { retarget as retargetAdTrackers } from 'calypso/lib/analytics/ad-tracking';
import { retargetFullStory } from 'calypso/lib/analytics/fullstory';
import { updateQueryParamsTracking } from 'calypso/lib/analytics/sem';
import { saveCouponQueryArgument, refreshCountryCodeCookieGdpr } from 'calypso/lib/analytics/utils';
import { gaRecordPageView } from './ga';
import { processQueue } from './queue';
import { referRecordPageView } from './refer';

export function recordPageView( urlPath, pageTitle, params = {}, options = {} ) {
	// Add delay to avoid stale `_dl` in recorded calypso_page_view event details.
	// `_dl` (browserdocumentlocation) is read from the current URL by external JavaScript.
	setTimeout( async function () {
		await refreshCountryCodeCookieGdpr();
		// Tracks, Google Analytics, Refer platform.
		recordTracksPageViewWithPageParams( urlPath, params );
		gaRecordPageView( urlPath, pageTitle, options?.useJetpackGoogleAnalytics );
		referRecordPageView();

		// Retargeting.
		saveCouponQueryArgument();
		updateQueryParamsTracking();
		await retargetAdTrackers( urlPath );

		// FullStory.
		retargetFullStory();

		// Process queue.
		processQueue();
	}, 0 );
}
