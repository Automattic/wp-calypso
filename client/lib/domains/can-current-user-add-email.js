/**
 * @typedef { import("client/lib/domains/types").ResponseDomain } ResponseDomain domain object
 */
/**
 * Determines if email can be added to the provided domain.
 * Additional checks are not performed for existing email subscriptions
 *
 * @param {ResponseDomain|undefined} domain domain object
 * @returns {boolean} - whether email can be added to the domain
 */
export function canCurrentUserAddEmail( domain ) {
	return !! domain?.currentUserCanAddEmail;
}
