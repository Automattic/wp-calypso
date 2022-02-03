import { isWpMobileApp } from 'calypso/lib/mobile-app';
import isCountryInGdprZone from './is-country-in-gdpr-zone';

/**
 * Returns a boolean indicating whether a GDPR banner should be shown.
 *
 * Defaults to `false` if the country code is unknown.
 *
 * @param countryCode Country code determined either from cookie or from a special header
 * @param sensitivePixelOption Value of the `sensitive_pixel_option` cookie
 *
 * @returns Whether the current user could be in the GDPR zone. When the `countryCode` is
 * `undefined`, we return `null` which has a meaning of "result unknown".
 */
export default function shouldSeeGdprBanner(
	countryCode: string | undefined,
	sensitivePixelOption: string | undefined
): boolean | null {
	// the banner is not shown for pages embedded as web view inside the mobile app
	if ( isWpMobileApp() ) {
		return false;
	}

	// the request for consent has already been answered, we no longer need to ask
	if ( sensitivePixelOption === 'yes' || sensitivePixelOption === 'no' ) {
		return false;
	}

	// if the country code is unknown, and we haven't yet tried to determine it, return `null`
	// with the meaning of "result unknown".
	if ( countryCode === undefined ) {
		return null;
	}

	// if the country code is still `unknown`, even after trying to determine it, we fail safely
	// and show the banner anyway.
	return countryCode === 'unknown' || isCountryInGdprZone( countryCode );
}
