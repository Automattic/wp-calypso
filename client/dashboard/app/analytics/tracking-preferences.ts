import cookie from 'cookie';
import { isCountryInGdprZone, isRegionInCcpaZone } from './geo-privacy';

type TrackingPrefs = {
	ok: boolean;
	buckets: {
		essential: boolean;
		analytics: boolean;
		advertising: boolean;
	};
};

type TrackingPrefsData = Partial<
	Omit< TrackingPrefs, 'buckets' > & { buckets: Partial< TrackingPrefs[ 'buckets' ] > }
>;

const COOKIE_MAX_AGE = 60 * 60 * 24 * ( 365.25 / 2 ); // 365.25 is the average number of days in a year.
const TRACKING_PREFS_COOKIE_V1 = 'sensitive_pixel_option';
const TRACKING_PREFS_COOKIE_V2 = 'sensitive_pixel_options';

const prefsDisallowAll: TrackingPrefs = {
	ok: false,
	buckets: {
		essential: true, // essential bucket is always allowed
		analytics: false,
		advertising: false,
	},
};

const prefsAllowAnalyticsGdpr: TrackingPrefs = {
	ok: false, // false is important so the cookie banner is shown
	buckets: {
		essential: true,
		analytics: true, // in GDPR zone, analytics is opt-out
		advertising: false, // in GDPR zone, advertising is opt-in
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

export function setTrackingPrefs( newPrefs: TrackingPrefsData ): TrackingPrefs {
	const { ok, buckets } = getTrackingPrefs();

	const newOptions = {
		ok: typeof newPrefs.ok === 'boolean' ? newPrefs.ok : ok,
		buckets: {
			...buckets,
			...newPrefs.buckets,
		},
	};

	document.cookie = cookie.serialize( TRACKING_PREFS_COOKIE_V2, JSON.stringify( newOptions ), {
		path: '/',
		maxAge: COOKIE_MAX_AGE,
	} );

	return newOptions;
}

/**
 * Returns consents for every Cookie Jar bucket based on privacy driven approach
 *
 * WARNING: this function is meant to work on the client side. If not called
 *          from the client side then it defaults to allow all
 * @returns Whether we may track the current user
 */
export function getTrackingPrefs(): TrackingPrefs {
	if ( typeof document === 'undefined' ) {
		return prefsAllowAll;
	}

	const cookies = cookie.parse( document.cookie );
	const isCountryGdpr = isCountryInGdprZone( cookies.country_code );
	const isCountryCcpa = isRegionInCcpaZone( cookies.country_code, cookies.region );

	if ( ! isCountryGdpr && ! isCountryCcpa ) {
		return prefsAllowAll;
	}

	// Default tracking mechanism for GDPR is opt-in for marketing and opt-out for anaytics, for CCPA is opt-out:
	const defaultPrefs = isCountryGdpr ? prefsAllowAnalyticsGdpr : prefsAllowAll;

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
