import wpcom from 'calypso/lib/wp';

/**
 * Temporary location.
 *
 * This helper exists to centralize how A4A makes WPCOM requests in the dashboard.
 * Once the A4A API surface is fully standardized, prefer removing this indirection
 * and using query builders from `@automattic/api-queries` directly.
 *
 * A4A WPCOM request helper.
 *
 * We use the standard dashboard auth flow (`wpcom_token`) rather than the legacy
 * A4A-specific token (`wpcom_token_a4a`) to avoid OAuth loops in dashboard environments.
 */
export async function wpcomA4ARequest< T >(
	params: Parameters< ( typeof wpcom )[ 'req' ][ 'get' ] >[ 0 ]
) {
	return ( await wpcom.req.get( params ) ) as T;
}
