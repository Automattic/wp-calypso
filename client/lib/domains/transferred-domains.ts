import { ResponseDomain } from 'calypso/lib/domains/types';
import { type as domainTypes } from './constants';

/**
 * Returns all domains in the list that were transferred in to WordPress.com.
 */
export function getTransferredInDomains( domains: ResponseDomain[] ) {
	return domains.filter( isTransferredInDomain );
}

/**
 * Checks if a domain was transferred in to WordPress.com from another registrar.
 */
export function isTransferredInDomain( domain: ResponseDomain ) {
	return domain.type === domainTypes.TRANSFER;
}
