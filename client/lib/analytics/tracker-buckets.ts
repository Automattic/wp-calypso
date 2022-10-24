import { getDoNotTrack } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { isPiiUrl, mayWeTrackCurrentUser } from 'calypso/lib/analytics/utils';
import { isE2ETest } from 'calypso/lib/e2e';

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

type BucketOption = 'essential' | 'analytics' | 'advertising' | null;

export const AdTrackersBuckets: { [ key in AdTracker ]: BucketOption } = {
	// Analytics trackers:
	[ AdTracker.GA ]: 'analytics',

	// Advertising trackers:
	[ AdTracker.GA_ENHANCED_ECOMMERCE ]: 'advertising',
	[ AdTracker.FULLSTORY ]: 'advertising',
	[ AdTracker.HOTJAR ]: 'advertising',
	[ AdTracker.BING ]: 'advertising',
	[ AdTracker.FLOODLIGHT ]: 'advertising',
	[ AdTracker.GOOGLE_ADS ]: 'advertising',
	[ AdTracker.OUTBRAIN ]: 'advertising',
	[ AdTracker.PINTEREST ]: 'advertising',
	[ AdTracker.TWITTER ]: 'advertising',
	[ AdTracker.FACEBOOK ]: 'advertising',

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

export const mayWeTrackByTracker = ( tracker: AdTracker ) => {
	if ( ! mayWeTrackGeneral() ) {
		return false;
	}

	const trackerBucket = AdTrackersBuckets[ tracker ];
	return null !== trackerBucket && mayWeTrackCurrentUser( trackerBucket );
};

// TODO: isWpcomGoogleAdsGtagEnabled - decide how to split ( there is also Jetpack GAds )
// TODO: Sort out trackers for Jetpack / WPCOM enviornments
