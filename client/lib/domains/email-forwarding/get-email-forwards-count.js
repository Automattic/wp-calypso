/**
 * @param domain A domain object returned from the domains REST API
 * @returns {number} The number of email forwards for that domain.
 */
export function getEmailForwardsCount( domain ) {
	return domain?.emailForwardsCount ?? 0;
}
