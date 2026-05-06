import { getCurrentUser } from '@automattic/calypso-analytics';
import { getAnonId } from './anon-id';

const OVERRIDES_KEY = 'explat_attribute_overrides';

/**
 * Locally-derived attributes for client-side flag evaluation.
 *
 * For full coverage (country code, `is_test_user`, etc.) the server emits a
 * private `window.__EXPLAT_RUNTIME__.attributes` map that the package overlays
 * on top of these. This helper provides the boot-time minimum so the eval
 * still works before the runtime bootstrap is in place.
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
