/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

export default function getMembershipsConnectedAccounts( state ) {
	return get( state, [ 'memberships', 'connectedAccounts', 'accounts' ], {} );
}
