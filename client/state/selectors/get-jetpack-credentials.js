/**
 * External Dependencies
 */
import { get, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/jetpack/init';

// We might have to re-think this approach since the credentials from `jetpackScan.scan[siteId].credentials`
// are only updated when we receive a new response from `/scan`. So, for instance, if a user completes
// the server credentials form, this selector won't reflect that fact since submitting that form doesn't
// requires fetching the state of the scan. In other words, we won't have those new credentials available
// from this selector. What should be the main source of truth for credentials?
export default function getJetpackCredentials( state, siteId, role ) {
	const scanCredentials = get( state, [ 'jetpackScan', 'scan', siteId, 'credentials' ], false );
	// If we don't find credentials in `jetpackScan.scan[siteId].credentials` we use
	// `jetpack.credentials.items[siteId].role as a fallback.
	if ( ! isEmpty( scanCredentials ) ) {
		return scanCredentials.filter( ( credential ) => credential.role === role );
	}
	return get( state, [ 'jetpack', 'credentials', 'items', siteId, role ], {} );
}
