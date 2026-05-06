import { getCurrentUser } from '@automattic/calypso-analytics';
import { getAnonId } from './anon-id';

/**
 * Locally-derived attributes for client-side flag evaluation.
 *
 * For full coverage (country code, `is_test_user`, etc.) the server emits a
 * private `window.__EXPLAT_RUNTIME__.attributes` map that the package overlays
 * on top of these. This helper provides the boot-time minimum so the eval
 * still works before the runtime bootstrap is in place.
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

	return attributes;
}
