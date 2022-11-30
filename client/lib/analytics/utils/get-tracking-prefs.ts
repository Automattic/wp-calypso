import cookie from 'cookie';
import isCountryInGdprZone from './is-country-in-gdpr-zone';
import isRegionInCcpaZone from './is-region-in-ccpa-zone';

const v1CookieName = 'sensitive_pixel_option';
const v2CookieName = 'sensitive_pixel_options';

export type TrackingPrefs = {
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

export const parseTrackingPrefs = ( cookieV2?: string, cookieV1?: string ): TrackingPrefs => {
	const { ok, buckets }: Partial< TrackingPrefs > = cookieV2 ? JSON.parse( cookieV2 ) : {};

	if ( typeof ok === 'boolean' ) {
		return {
			ok,
			buckets: {
				...allBucketsFalse,
				...buckets,
			},
		};
	} else if ( cookieV1 && [ 'yes', 'no' ].includes( cookieV1 ) ) {
		return {
			ok: cookieV1 === 'yes',
			buckets: allBucketsTrue,
		};
	}

	return {
		ok: false,
		buckets: allBucketsFalse,
	};
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

	if (
		! isCountryInGdprZone( cookies.country_code ) &&
		! isRegionInCcpaZone( cookies.country_code, cookies.region )
	) {
		return {
			ok: true,
			buckets: allBucketsTrue,
		};
	}

	return parseTrackingPrefs( cookies[ v2CookieName ], cookies[ v1CookieName ] );
}
