/**
 * External Dependencies
 */
import { get } from 'lodash';

export default function hasMainCredentials( state, siteId ) {
	return !! get( state, [ 'jetpack', 'credentials', 'items', siteId, 'main' ], false );
}
