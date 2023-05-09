import { get } from 'lodash';
import { type as domainTypes } from './constants';

export function isMappedDomain( domain ) {
	return domain.type === domainTypes.MAPPED;
}

export function getMappedDomains( domains ) {
	return domains.filter( isMappedDomain );
}

export function hasMappedDomain( domains ) {
	return getMappedDomains( domains ).length > 0;
}

/**
 * Checks if the supplied domain is a mapped domain and has WordPress.com name servers.
 *
 * @param {Object} domain - domain object
 * @returns {boolean} - true if the domain is mapped and has WordPress.com name servers, false otherwise
 */
export function isMappedDomainWithWpcomNameservers( domain ) {
	return isMappedDomain( domain ) && get( domain, 'hasWpcomNameservers', false );
}
