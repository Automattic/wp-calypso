/**
 * External dependencies
 */
import { get } from 'lodash';

export function isGSuiteSubscriptionActive( domain ) {
	const status = get( domain, 'googleAppsSubscription.status', '' );

	return 'active' === status;
}
