import { wpcom } from '../wpcom-fetcher';
import type { ContactValidationRequestContactInformation, WhoisDataEntry } from './types';

export function fetchDomainWhois( domainName: string ): Promise< WhoisDataEntry[] > {
	return wpcom.req.get( {
		path: `/domains/${ domainName }/whois`,
		apiVersion: '1.1',
	} );
}

/**
 * Fetches the user's cached domain contact information from the API.
 * This is used to pre-fill domain contact forms during checkout.
 * @see POST /me/domain-contact-information to update
 */
export function fetchCachedDomainContactInfo(): Promise< ContactValidationRequestContactInformation > {
	return wpcom.req.get( {
		path: '/me/domain-contact-information',
		apiVersion: '1.1',
	} );
}
