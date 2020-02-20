/**
 * External Dependencies
 */
import { get } from 'lodash';

export default function getJetpackCredentialsUpdateStatus( state, siteId ) {
	return get( state, [ 'jetpack', 'credentials', 'requestStatus', siteId ], 'unsubmitted' );
}
