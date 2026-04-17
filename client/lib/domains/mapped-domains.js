import { get } from 'lodash';
import { type as domainTypes } from './constants';

/**
 * Checks if a domain is a mapped domain — i.e. registered externally and pointed to WordPress.com.
 * @param {Object} domain - domain object
 * @returns {boolean}
 */
export function isMappedDomain( domain ) {
	return domain.type === domainTypes.MAPPED;
}

/**
 * Returns all mapped domains from the provided list.
 * @param {Object[]} domains - array of domain objects
 * @returns {Object[]} - subset of domains whose type is MAPPED
 */
export function getMappedDomains( domains ) {
	return domains.filter( isMappedDomain );
}

/**
 * Checks if at least one mapped domain exists in the provided list.
 * @param {Object[]} domains - array of domain objects
 * @returns {boolean}
 */
export function hasMappedDomain( domains ) {
	return getMappedDomains( domains ).length > 0;
}

/**
 * Checks if the supplied domain is a mapped domain and has WordPress.com name servers.
 * @param {Object} domain - domain object
 * @returns {boolean} - true if the domain is mapped and has WordPress.com name servers, false otherwise
 */
export function isMappedDomainWithWpcomNameservers( domain ) {
	return isMappedDomain( domain ) && get( domain, 'hasWpcomNameservers', false );
}
