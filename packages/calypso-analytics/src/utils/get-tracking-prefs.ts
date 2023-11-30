import cookie from 'cookie';
import isCountryInGdprZone from './is-country-in-gdpr-zone';
import isRegionInCcpaZone from './is-region-in-ccpa-zone';

export const TRACKING_PREFS_COOKIE_V1 = 'sensitive_pixel_option';
export const TRACKING_PREFS_COOKIE_V2 = 'sensitive_pixel_options';

export type TrackingPrefs = {
	ok: boolean;
	buckets: {
		essential: boolean;
		analytics: boolean;
		advertising: boolean;
	};
};

const prefsDisallowAll: TrackingPrefs = {
	ok: false,
	buckets: {
		essential: true, // essential bucket is always allowed
		analytics: false,
		advertising: false,
	},
};

const prefsAllowAll: TrackingPrefs = {
	ok: true,
	buckets: {
		essential: true,
		analytics: true,
		advertising: true,
	},
};

export const parseTrackingPrefs = (
	cookieV2?: string,
	cookieV1?: string,
	defaultPrefs = prefsDisallowAll
): TrackingPrefs => {
	const { ok, buckets }: Partial< TrackingPrefs > = cookieV2 ? JSON.parse( cookieV2 ) : {};

	if ( typeof ok === 'boolean' ) {
		return {
			ok,
			buckets: {
				...defaultPrefs.buckets,
				...buckets,
			},
		};
	} else if ( cookieV1 && [ 'yes', 'no' ].includes( cookieV1 ) ) {
		return {
			ok: cookieV1 === 'yes',
			buckets: prefsAllowAll.buckets,
		};
	}

	return defaultPrefs;
};

/**
 * Returns consents for every Cookie Jar bucket based on privacy driven approach
 *
 * WARNING: this function only works on the client side.
 * @returns Whether we may track the current user
 */
export default function getTrackingPrefs(): TrackingPrefs {
	if ( typeof document === 'undefined' ) {
		throw new Error( 'getTrackingPrefs() can only be called on the client side' );
	}

	const cookies = cookie.parse( document.cookie );
	const isCountryGdpr = isCountryInGdprZone( cookies.country_code );
	const isCountryCcpa = isRegionInCcpaZone( cookies.country_code, cookies.region );

	if ( ! isCountryGdpr && ! isCountryCcpa ) {
		return prefsAllowAll;
	}

	// default tracking mechanism for GDPR is opt-in, for CCPA is opt-out:
	const defaultPrefs = isCountryGdpr ? prefsDisallowAll : prefsAllowAll;

	const { ok, buckets } = parseTrackingPrefs(
		cookies[ TRACKING_PREFS_COOKIE_V2 ],
		cookies[ TRACKING_PREFS_COOKIE_V1 ],
		defaultPrefs
	);

	if ( isCountryCcpa ) {
		// For CCPA, only the advertising bucket is relevant, the rest are always true
		return {
			ok,
			buckets: {
				...prefsAllowAll.buckets,
				advertising: buckets.advertising,
			},
		};
	}

	// For CCPA, only the advertising bucket is relevant, the rest are always true
	return { ok, buckets };
}
