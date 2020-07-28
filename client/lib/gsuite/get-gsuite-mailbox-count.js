/**
 * External dependencies
 */
import { get } from 'lodash';

export function getGSuiteMailboxCount( domain ) {
	return get( domain, 'googleAppsSubscription.totalUserCount', 0 );
}
