import { getCurrentUser } from '@automattic/calypso-analytics';
import cookie from 'cookie';
import { getAnonId } from './anon-id';
import { isDevelopmentMode } from './misc';

// SSR safety: forbid raw `window` references without an explicit undefined check.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const window: undefined | ( Window & typeof globalThis );

const OVERRIDES_KEY = 'explat_attribute_overrides';

let cachedCountryCode: string | null | undefined;

/**
 * Best-effort country code (ISO 3166-1 alpha-2). Reads the `country_code`
 * cookie set by `client/boot/geolocation.ts` synchronously; if the cookie
 * isn't present yet, falls back to the public geo API once and memoizes the
 * result for the page's lifetime. Returns null when no source produces a
 * value (offline, network error, or `unknown`).
 */
async function getCountryCode(): Promise< string | null > {
	if ( cachedCountryCode !== undefined ) {
		return cachedCountryCode;
	}
	if ( typeof document === 'undefined' ) {
		cachedCountryCode = null;
		return cachedCountryCode;
	}
	const cookies = cookie.parse( document.cookie );
	if ( cookies.country_code && cookies.country_code !== 'unknown' ) {
		cachedCountryCode = cookies.country_code;
		return cachedCountryCode;
	}
	try {
		const response = await fetch( 'https://public-api.wordpress.com/geo/' );
		const data = ( await response.json() ) as { country_short?: string };
		cachedCountryCode =
			data.country_short && data.country_short !== 'unknown' ? data.country_short : null;
		return cachedCountryCode;
	} catch {
		cachedCountryCode = null;
		return cachedCountryCode;
	}
}

/**
 * Locally-derived attributes for client-side flag evaluation.
 *
 * Server-emitted `window.__EXPLAT_RUNTIME__.attributes` is overlaid on top of
 * these (it wins on conflicts) once the runtime bootstrap is in place. We
 * forward `country` and `is_test_user` here so audience rules with those
 * conditions can match even before the runtime is deployed.
 *
 * Dev-only override: set `localStorage.explat_attribute_overrides` to a JSON
 * object to force attribute values for testing — e.g.
 * `localStorage.setItem('explat_attribute_overrides', JSON.stringify({country:'US',language:'en',is_test_user:'true'}))`.
 */
export default async function getAttributes(): Promise< Record< string, string > > {
	const attributes: Record< string, string > = {};

	const user = getCurrentUser();
	if ( user ) {
		attributes.wpcom_user_id = String( user.ID );
		if ( user.localeSlug ) {
			attributes.language = user.localeSlug;
		}
	}

	const anonId = await getAnonId();
	if ( anonId ) {
		attributes.anon_id = anonId;
	}

	const country = await getCountryCode();
	if ( country ) {
		attributes.country = country;
	}

	// Mark non-production sessions as test users so audience rules with
	// `{is_test_user: {$exists: true}}` (the standard a8c-only gate) match
	// against the local dev sidebar. In production this attribute is injected
	// server-side via `__EXPLAT_RUNTIME__.attributes` based on staff auth, not
	// here — `isDevelopmentMode` is webpack's NODE_ENV !== 'production' gate
	// and never true in shipped bundles.
	if ( isDevelopmentMode ) {
		attributes.is_test_user = 'true';
	}

	if ( typeof window !== 'undefined' ) {
		try {
			const raw = window.localStorage.getItem( OVERRIDES_KEY );
			if ( raw ) {
				Object.assign( attributes, JSON.parse( raw ) );
			}
		} catch ( e ) {
			// Ignore parse errors — overrides are dev-only.
		}
	}

	return attributes;
}
