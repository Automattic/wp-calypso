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

const allowTrackingPrefs: TrackingPrefs = {
	ok: true,
	buckets: {
		essential: true,
		analytics: true,
		advertising: true,
	},
};

const disallowTrackingPrefs: TrackingPrefs = {
	ok: false,
	buckets: {
		essential: false,
		analytics: false,
		advertising: false,
	},
};

export const parseTrackingPrefs = (
	cookieV2?: string,
	cookieV1?: string,
	defaultPrefs = disallowTrackingPrefs
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
			...allowTrackingPrefs,
			ok: cookieV1 === 'yes',
		};
	}

	return defaultPrefs;
};

/**
 * Returns consents for every Cookie Jar bucket based on privacy driven approach
 *
 * WARNING: this function only works on the client side.
 *
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
		return allowTrackingPrefs;
	}

	const { ok, buckets } = parseTrackingPrefs(
		cookies[ TRACKING_PREFS_COOKIE_V2 ],
		cookies[ TRACKING_PREFS_COOKIE_V1 ],
		// default tracking mechanism for GDPR is opt-in, for CCPA is opt-out:
		isCountryGdpr ? disallowTrackingPrefs : allowTrackingPrefs
	);

	if ( isCountryCcpa ) {
		// For CCPA, only the advertising bucket is relevant, the rest are always true
		return {
			ok,
			buckets: {
				...allowTrackingPrefs.buckets,
				advertising: buckets.advertising,
			},
		};
	}

	// For CCPA, only the advertising bucket is relevant, the rest are always true
	return { ok, buckets };
}
