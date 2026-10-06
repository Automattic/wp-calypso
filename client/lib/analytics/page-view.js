// pageView is a wrapper for pageview events across Tracks and GA.

import { recordTracksPageViewWithPageParams } from '@automattic/calypso-analytics';
import { resolveDeviceTypeByViewPort } from '@automattic/viewport';
import { retarget as retargetAdTrackers } from 'calypso/lib/analytics/ad-tracking';
import saveImpactAffiliateClickId from 'calypso/lib/analytics/impact-affiliate';
import { updateQueryParamsTracking } from 'calypso/lib/analytics/sem';
import { refreshCountryCodeCookieGdpr, saveCouponQueryArgument } from 'calypso/lib/analytics/utils';
import { gaRecordPageView } from './ga';
import { processQueue } from './queue';
import { referRecordPageView } from './refer';

export function recordPageView( urlPath, pageTitle, params = {}, options = {} ) {
	// Add delay to avoid stale `_dl` in recorded calypso_page_view event details.
	// `_dl` (browserdocumentlocation) is read from the current URL by external JavaScript.
	setTimeout( () => {
		// Add device type to Tracks page view event.
		params.device_type = resolveDeviceTypeByViewPort();

		// Tracks, Google Analytics, Refer platform.
		recordTracksPageViewWithPageParams( urlPath, params );
		safeGoogleAnalyticsPageView(
			urlPath,
			pageTitle,
			options?.useJetpackGoogleAnalytics,
			options?.useAkismetGoogleAnalytics,
			options?.useA8CForAgenciesGoogleAnalytics
		);
		referRecordPageView();
		saveImpactAffiliateClickId();

		// Retargeting.
		saveCouponQueryArgument();
		updateQueryParamsTracking();
		retargetAdTrackers( urlPath );

		// Process queue.
		processQueue();
	}, 0 );
}

async function safeGoogleAnalyticsPageView(
	urlPath,
	pageTitle,
	useJetpackGoogleAnalytics = false,
	useAkismetGoogleAnalytics = false,
	useA8CForAgenciesGoogleAnalytics = false
) {
	await refreshCountryCodeCookieGdpr();
	gaRecordPageView(
		urlPath,
		pageTitle,
		useJetpackGoogleAnalytics,
		useAkismetGoogleAnalytics,
		useA8CForAgenciesGoogleAnalytics
	);
}
