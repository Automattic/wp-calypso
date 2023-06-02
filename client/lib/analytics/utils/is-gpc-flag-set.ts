import cookie from 'cookie';
import isRegionInCcpaZone from './is-region-in-ccpa-zone';

/**
 * The Global Privacy Control (GPC) flag is a browser setting that allows users to signal their privacy preference to websites.
 * It's still not implemented across browsers, so adding it here.
 * See: <https://globalprivacycontrol.org/>
 */
declare global {
	interface Navigator {
		globalPrivacyControl?: boolean;
	}
}

/**
 * Checks if the GPC flag is set in the user's browser.
 *
 * @returns {boolean} - True if the GPC flag is set, false otherwise (flag is undefined or false).
 */
export const isGpcFlagSetOptOut = (): boolean => {
	return window.navigator?.globalPrivacyControl === true;
};

/**
 * May we track the user with GPC flag in CCPA region?
 *
 * @returns {boolean} - False if the user is in the CCPA region and the GPC flag is set, true otherwise.
 */
export const mayWeTrackUserGpcInCcpaRegion = (): boolean => {
	const cookies = cookie.parse( document.cookie );
	if ( isRegionInCcpaZone( cookies.country_code, cookies.region ) && isGpcFlagSetOptOut() ) {
		return false;
	}
	return true;
};
