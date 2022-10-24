import { getDoNotTrack } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { isPiiUrl, isUrlExcludedForPerformance } from 'calypso/lib/analytics/utils';
import { isE2ETest } from 'calypso/lib/e2e';
import getTrackingPrefs from './utils/get-tracking-prefs';

export enum AdTracker {
	BING = 'bing',
	FLOODLIGHT = 'floodlight',
	FULLSTORY = 'fullstory',
	GOOGLE_ADS = 'gads',
	GA = 'ga',
	GA_ENHANCED_ECOMMERCE = 'gaEnhancedEcommerce',
	HOTJAR = 'hotjar',
	OUTBRAIN = 'outbrain',
	PINTEREST = 'pinterest',
	TWITTER = 'twitter',
	FACEBOOK = 'facebook',
	QUANTCAST = 'quantast',
	GEMINI = 'gemini',
	EXPERIAN = 'experian',
	ICON_MEDIA = 'icon-media',
	LINKEDIN = 'linkedin',
	CRITEO = 'criteo',
	PANDORA = 'pandora',
	QUORA = 'quora',
	ADROLL = 'adroll',
}

export enum Bucket {
	ESSENTIAL = 'essential',
	ADVERTISING = 'advertising',
	ANALYTICS = 'analytics',
}

export const AdTrackersBuckets: { [ key in AdTracker ]: Bucket | null } = {
	// Analytics trackers:
	[ AdTracker.GA ]: Bucket.ANALYTICS,

	// Advertising trackers:
	[ AdTracker.GA_ENHANCED_ECOMMERCE ]: Bucket.ADVERTISING,
	[ AdTracker.FULLSTORY ]: Bucket.ADVERTISING,
	[ AdTracker.HOTJAR ]: Bucket.ADVERTISING,
	[ AdTracker.BING ]: Bucket.ADVERTISING,
	[ AdTracker.FLOODLIGHT ]: Bucket.ADVERTISING,
	[ AdTracker.GOOGLE_ADS ]: Bucket.ADVERTISING,
	[ AdTracker.OUTBRAIN ]: Bucket.ADVERTISING,
	[ AdTracker.PINTEREST ]: Bucket.ADVERTISING,
	[ AdTracker.TWITTER ]: Bucket.ADVERTISING,
	[ AdTracker.FACEBOOK ]: Bucket.ADVERTISING,

	// Disabled trackers:
	[ AdTracker.QUANTCAST ]: null,
	[ AdTracker.GEMINI ]: null,
	[ AdTracker.EXPERIAN ]: null,
	[ AdTracker.ICON_MEDIA ]: null,
	[ AdTracker.LINKEDIN ]: null,
	[ AdTracker.CRITEO ]: null,
	[ AdTracker.PANDORA ]: null,
	[ AdTracker.QUORA ]: null,
	[ AdTracker.ADROLL ]: null,
};

export const mayWeTrackGeneral = () =>
	! isE2ETest() && ! getDoNotTrack() && ! isPiiUrl() && config.isEnabled( 'ad-tracking' );

export const mayWeTrackByBucket = ( bucket: Bucket ) => {
	if ( ! mayWeTrackGeneral() ) {
		return false;
	}

	// Disable advertising trackers on specific urls
	if ( 'advertising' === bucket && isUrlExcludedForPerformance() ) {
		return false;
	}

	const prefs = getTrackingPrefs();
	return prefs.ok && prefs.buckets[ bucket ];
};

export const mayWeTrackByTracker = ( tracker: AdTracker ) => {
	const bucket = AdTrackersBuckets[ tracker ];

	return null !== bucket && mayWeTrackByBucket( bucket );
};

// TODO: isWpcomGoogleAdsGtagEnabled - decide how to split ( there is also Jetpack GAds )
// TODO: Sort out trackers for Jetpack / WPCOM enviornments
