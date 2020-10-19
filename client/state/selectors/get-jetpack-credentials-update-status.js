/**
 * External Dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/jetpack/init';

export default function getJetpackCredentialsUpdateStatus( state, siteId ) {
	return get( state, [ 'jetpack', 'credentials', 'updateRequestStatus', siteId ], 'unsubmitted' );
}
