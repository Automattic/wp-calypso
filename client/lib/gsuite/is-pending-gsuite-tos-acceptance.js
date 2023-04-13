/**
 * Does a domain have a G Suite account where the terms of service
 * need to be accepted.
 *
 * @param {Object} domain - domain object
 * @returns {boolean} - Does domain have a G Suite account pending ToS acceptance
 */
export function isPendingGSuiteTOSAcceptance( domain ) {
	return domain?.googleAppsSubscription?.pendingTosAcceptance ?? false;
}
