/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Given a domain object, does that domain have G Suite with another provider.
 *
 * @param {object} domain - domain object
 * @returns {boolean} - true if the domain is with another provider, false otherwise
 */
export function hasGSuiteWithAnotherProvider( domain ) {
	const status = get( domain, 'googleAppsSubscription.status', '' );

	return 'other_provider' === status;
}
