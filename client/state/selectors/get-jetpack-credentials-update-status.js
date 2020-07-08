/**
 * External Dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/jetpack/init';

export default function getJetpackCredentialsUpdateStatus( state, siteId ) {
	return get( state, [ 'jetpack', 'credentials', 'requestStatus', siteId ], 'unsubmitted' );
}
