import { getDoNotTrack } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { isPiiUrl, isUrlExcludedForPerformance } from 'calypso/lib/analytics/utils';
import { isE2ETest } from 'calypso/lib/e2e';
import getTrackingPrefs from './utils/get-tracking-prefs';

const allAdTrackers = [
	'bing',
	'floodlight',
	'fullstory',
	'googleAds',
	'ga',
	'gaEnhancedEcommerce',
	'hotjar',
	'outbrain',
	'pinterest',
	'twitter',
	'facebook',
	'quantcast',
	'gemini',
	'experian',
	'iconMedia',
	'linkedin',
	'criteo',
	'pandora',
	'quora',
	'adroll',
] as const;

type AdTracker = typeof allAdTrackers[ number ];

export enum Bucket {
	ESSENTIAL = 'essential',
	ADVERTISING = 'advertising',
	ANALYTICS = 'analytics',
}

export const AdTrackersBuckets: { [ key in AdTracker ]: Bucket | null } = {
	// Analytics trackers:
	ga: Bucket.ANALYTICS,

	// Advertising trackers:
	gaEnhancedEcommerce: Bucket.ADVERTISING,
	fullstory: Bucket.ADVERTISING,
	hotjar: Bucket.ADVERTISING,
	bing: Bucket.ADVERTISING,
	floodlight: Bucket.ADVERTISING,
	googleAds: Bucket.ADVERTISING,
	outbrain: Bucket.ADVERTISING,
	pinterest: Bucket.ADVERTISING,
	twitter: Bucket.ADVERTISING,
	facebook: Bucket.ADVERTISING,

	// Disabled trackers:
	quantcast: null,
	gemini: null,
	experian: null,
	iconMedia: null,
	linkedin: null,
	criteo: null,
	pandora: null,
	quora: null,
	adroll: null,
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
