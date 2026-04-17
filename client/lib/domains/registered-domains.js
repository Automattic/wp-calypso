import { type as domainTypes } from './constants';

/**
 * Returns all domains in the list that were registered through WordPress.com.
 * @param {Object[]} domains - array of domain objects
 * @returns {Object[]} - subset of domains whose type is REGISTERED
 */
export function getRegisteredDomains( domains ) {
	return domains.filter( isRegisteredDomain );
}

/**
 * Checks if a domain was registered directly through WordPress.com (not mapped or transferred).
 * @param {Object} domain - domain object
 * @returns {boolean}
 */
export function isRegisteredDomain( domain ) {
	return domain.type === domainTypes.REGISTERED;
}

/**
 * Checks if a domain is a free WordPress.com subdomain (e.g. example.wordpress.com).
 * These are the built-in free addresses assigned to every WordPress.com site.
 * @param {Object} domain - domain object
 * @returns {boolean}
 */
export function isFreeUrlDomain( domain ) {
	return domain.type === domainTypes.WPCOM;
}
