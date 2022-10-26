import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { TRACKING_IDS } from '../ad-tracking/constants';

/**
 * Determines the correct ga for either WPCOM or Jetpack environment
 *
 * @returns The correct Gtag connected to GA environment
 */
export const getGaGtag = ( isJetpackEnv = isJetpackCloud() ) => {
	return ! isJetpackEnv
		? TRACKING_IDS.wpcomGoogleAnalyticsGtag
		: TRACKING_IDS.jetpackGoogleAnalyticsGtag;
};
