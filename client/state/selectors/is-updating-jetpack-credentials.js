/**
 * External Dependencies
 */
import { get } from 'lodash';

export default function isUpdatingJetpackCredentials( state, siteId ) {
	return get( state, [ 'jetpack', 'credentials', 'updateRequesting', siteId ], false );
}
