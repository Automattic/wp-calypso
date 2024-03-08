import isAkismetCheckout from 'calypso/lib/akismet/is-akismet-checkout';
import isJetpackCheckout from 'calypso/lib/jetpack/is-jetpack-checkout';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { TRACKING_IDS } from '../ad-tracking/constants';

/**
 * Determines the correct ga for either WPCOM or Jetpack environment
 * @returns The correct Gtag connected to GA environment
 */
export const getGaGtag = (
	isJetpackEnv = isJetpackCloud() || isJetpackCheckout(),
	isAkismetEnv = isAkismetCheckout()
) => {
	if ( isJetpackEnv ) {
		return TRACKING_IDS.jetpackGoogleAnalyticsGtag;
	} else if ( isAkismetEnv ) {
		return TRACKING_IDS.akismetGoogleAnalyticsGtag;
	}

	return TRACKING_IDS.wpcomGoogleAnalyticsGtag;
};
