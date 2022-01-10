/**
 *
 * @typedef { import("calypso/state/sites/domains/types").SiteDomain } SiteDomain domain object
 */
/**
 * Determines if email can be added to the provided domain.
 * Additional checks are not performed for existing email subscriptions
 *
 * @param {SiteDomain|undefined} domain domain object
 * @returns {boolean} - whether email can be added to the domain
 */
export function canCurrentUserAddEmail( domain ) {
	return !! domain?.currentUserCanAddEmail;
}
