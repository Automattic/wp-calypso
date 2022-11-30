import { getDoNotTrack } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { isPiiUrl, isUrlExcludedForPerformance } from 'calypso/lib/analytics/utils';
import { isE2ETest } from 'calypso/lib/e2e';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
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
	// 'ga' is categorized as analytics tracker in Jetpack Cloud, but not in Calypso
	ga: isJetpackCloud() ? Bucket.ANALYTICS : Bucket.ADVERTISING,

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

const checkGtagInit = (): boolean => 'dataLayer' in window && 'gtag' in window;

export const AdTrackersInitGuards: Partial< { [ key in AdTracker ]: () => boolean } > = {
	ga: checkGtagInit,
	gaEnhancedEcommerce: checkGtagInit,
	floodlight: checkGtagInit,
	googleAds: checkGtagInit,
	fullstory: () => 'FS' in window,
	hotjar: () => 'hj' in window,
	bing: () => 'uetq' in window,
	outbrain: () => 'obApi' in window,
	pinterest: () => 'pintrk' in window,
	twitter: () => 'twq' in window,
	facebook: () => 'fbq' in window,
	linkedin: () => '_linkedin_data_partner_id' in window,
	criteo: () => 'criteo_q' in window,
	quora: () => 'qp' in window,
	adroll: () => 'adRoll' in window,
};

const isTrackerIntialized = ( tracker: AdTracker ): boolean => {
	const guardFunction = AdTrackersInitGuards[ tracker ];
	// If there is no guard function, skip the check
	return guardFunction ? guardFunction() : true;
};

export const mayWeTrackGeneral = () =>
	! isE2ETest() && ! getDoNotTrack() && ! isPiiUrl() && config.isEnabled( 'ad-tracking' );

export const mayWeTrackByBucket = ( bucket: Bucket ) => {
	if ( ! mayWeTrackGeneral() ) {
		return false;
	}

	// Disable advertising trackers on specific urls
	if ( Bucket.ADVERTISING === bucket && isUrlExcludedForPerformance() ) {
		return false;
	}

	const prefs = getTrackingPrefs();
	return prefs.ok && prefs.buckets[ bucket ];
};

export const mayWeInitTracker = ( tracker: AdTracker ) => {
	const bucket = AdTrackersBuckets[ tracker ];
	return null !== bucket && mayWeTrackByBucket( bucket );
};

export const mayWeTrackByTracker = ( tracker: AdTracker ) =>
	mayWeInitTracker( tracker ) && isTrackerIntialized( tracker );
