import { isWpMobileApp } from 'calypso/lib/mobile-app';
import { TrackingPrefs } from './get-tracking-prefs';
import isCountryInGdprZone from './is-country-in-gdpr-zone';
import isRegionInCcpaZone from './is-region-in-ccpa-zone';

/**
 * Returns a boolean indicating whether a GDPR banner should be shown.
 *
 * Defaults to `false` if the country code is unknown.
 *
 * @param countryCode Country code determined either from cookie or from a special header
 * @param region Region determined either from cookie or from a special header
 * @param trackingPrefs Parsed object based on `sensitive_pixel_options` (v2) cookie structure
 * @returns Whether the current user could be in the GDPR/CCPA zone. When the `countryCode` and `region` are
 * `undefined`, we return `null` which has a meaning of "result unknown".
 */
export default function shouldSeeCookieBanner(
	countryCode?: string,
	region?: string,
	trackingPrefs?: TrackingPrefs
): boolean | null {
	// the banner is not shown for pages embedded as web view inside the mobile app
	if ( isWpMobileApp() ) {
		return false;
	}

	// the request for consent has already been answered, we no longer need to ask
	if ( trackingPrefs?.ok ) {
		return false;
	}

	// if the country code is unknown, and we haven't yet tried to determine it, return `null`
	// with the meaning of "result unknown".
	if ( countryCode === undefined && region === undefined ) {
		return null;
	}

	// if the country code is still `unknown`, even after trying to determine it, we fail safely
	// and show the banner anyway.
	return (
		countryCode === 'unknown' ||
		isCountryInGdprZone( countryCode ) ||
		region === 'unknown' ||
		isRegionInCcpaZone( countryCode, region )
	);
}
