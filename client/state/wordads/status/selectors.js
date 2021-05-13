/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/wordads/init';

export function isSiteWordadsUnsafe( state, siteId ) {
	return get( state, [ 'wordads', 'status', siteId, 'unsafe' ], false );
}
