import cookie from 'cookie';
import isCountryInGdprZone from './is-country-in-gdpr-zone';
import isRegionInCcpaZone from './is-region-in-ccpa-zone';

const v1CookieName = 'sensitive_pixel_option';
const v2CookieName = 'sensitive_pixel_options';

type TrackingPrefs = {
	ok: boolean;
	buckets: {
		essential: boolean;
		analytics: boolean;
		advertising: boolean;
	};
};

const allBucketsFalse: TrackingPrefs[ 'buckets' ] = {
	essential: false,
	analytics: false,
	advertising: false,
};

const allBucketsTrue: TrackingPrefs[ 'buckets' ] = {
	essential: true,
	analytics: true,
	advertising: true,
};

/**
 * Returns consents for every Cookie Jar bucket based on privacy driven approach
 *
 * WARNING: this function only works on the client side.
 *
 * @returns Whether we may track the current user
 */
export default function getTrackingPrefs(): TrackingPrefs {
	const cookies = cookie.parse( document.cookie );

	if ( ! isCountryInGdprZone( cookies.country_code ) && ! isRegionInCcpaZone( cookies.region ) ) {
		return {
			ok: true,
			buckets: allBucketsTrue,
		};
	}

	const oldUserConsent = cookies[ v1CookieName ];
	const userOptionsJson = cookies[ v2CookieName ];

	const { ok, buckets }: Partial< TrackingPrefs > = userOptionsJson
		? JSON.parse( userOptionsJson )
		: {};

	if ( typeof ok === 'boolean' ) {
		return {
			ok,
			buckets: {
				...allBucketsFalse,
				...buckets,
			},
		};
	} else if ( [ 'yes', 'no' ].includes( oldUserConsent ) ) {
		return {
			ok: oldUserConsent === 'yes',
			buckets: allBucketsTrue,
		};
	}

	return {
		ok: false,
		buckets: allBucketsFalse,
	};
}
