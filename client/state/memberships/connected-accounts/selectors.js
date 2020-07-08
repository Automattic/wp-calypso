/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/memberships/init';

export function isFetching( state ) {
	return get( state, [ 'memberships', 'connectedAccounts', 'isFetching' ], false );
}
