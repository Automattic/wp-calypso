/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

export default function isRequestingMembershipsSubscriptions( state ) {
	return get( state, 'memberships.subscriptions.requesting', false );
}
