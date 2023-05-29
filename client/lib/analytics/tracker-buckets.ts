import { getDoNotTrack } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import {
	isPiiUrl,
	isUrlExcludedForPerformance,
	getTrackingPrefs,
	mayWeTrackUserGpcInCcpaRegion,
} from 'calypso/lib/analytics/utils';
import { isE2ETest } from 'calypso/lib/e2e';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import isJetpackCheckout from '../jetpack/is-jetpack-checkout';

const allAdTrackers = [
	'bing',
	'floodlight',
	'googleAds',
	'googleTagManager',
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

type AdTracker = ( typeof allAdTrackers )[ number ];

export enum Bucket {
	ESSENTIAL = 'essential',
	ADVERTISING = 'advertising',
	ANALYTICS = 'analytics',
}

export const AdTrackersBuckets: { [ key in AdTracker ]: Bucket | null } = {
	// Analytics trackers:

	// Advertising trackers:
	ga: Bucket.ADVERTISING,
	gaEnhancedEcommerce: Bucket.ADVERTISING,
	hotjar: Bucket.ADVERTISING,
	bing: Bucket.ADVERTISING,
	floodlight: Bucket.ADVERTISING,
	googleAds: Bucket.ADVERTISING,
	googleTagManager: Bucket.ADVERTISING,
	outbrain: Bucket.ADVERTISING,
	pinterest: Bucket.ADVERTISING,
	twitter: Bucket.ADVERTISING,
	facebook: Bucket.ADVERTISING,

	// Advertising trackers (only Jetpack Cloud or on Jetpack Checkout):
	linkedin: isJetpackCloud() || isJetpackCheckout() ? Bucket.ADVERTISING : null,

	// Disabled trackers:
	quantcast: null,
	gemini: null,
	experian: null,
	iconMedia: null,
	criteo: null,
	pandora: null,
	quora: null,
	adroll: null,
};

const checkGtagInit = (): boolean => 'dataLayer' in window && 'gtag' in window;

const checkWooGTMInit = (): boolean => {
	return 'dataLayer' in window && 'google_tag_manager' in window;
};

export const AdTrackersInitGuards: Partial< { [ key in AdTracker ]: () => boolean } > = {
	ga: checkGtagInit,
	gaEnhancedEcommerce: checkGtagInit,
	floodlight: checkGtagInit,
	googleAds: checkGtagInit,
	googleTagManager: checkWooGTMInit,
	bing: () => 'uetq' in window,
	outbrain: () => 'obApi' in window,
	pinterest: () => 'pintrk' in window,
	twitter: () => 'twq' in window,
	facebook: () => 'fbq' in window,
	linkedin: () => '_linkedin_data_partner_ids' in window && 'lintrk' in window,
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

	if ( Bucket.ADVERTISING === bucket ) {
		// Disable advertising trackers on specific urls
		if ( isUrlExcludedForPerformance() ) {
			return false;
		}
		// Disable advertising trackers if GPC browser flag is set, and the user location pertains to CCPA.
		if ( ! mayWeTrackUserGpcInCcpaRegion() ) {
			return false;
		}
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
