import { wpcom } from '../wpcom-fetcher';
import type {
	DomainContactDetails,
	ContactValidationRequestContactInformation,
	DomainContactValidationResponse,
} from './types';

export function updateDomainWhois(
	domainName: string,
	domainContactDetails: DomainContactDetails,
	transferLock: boolean
): Promise< DomainContactValidationResponse > {
	return wpcom.req.post( {
		path: `/domains/${ domainName }/whois`,
		apiVersion: '1.1',
		body: {
			whois: domainContactDetails,
			transfer_lock: transferLock,
		},
	} );
}

export function validateDomainWhois(
	domainContactDetails: ContactValidationRequestContactInformation,
	domainNames: string[]
): Promise< DomainContactValidationResponse > {
	return wpcom.req.post( {
		path: '/me/domain-contact-information/validate',
		apiVersion: '1.1',
		body: {
			contact_information: domainContactDetails,
			domain_names: domainNames,
		},
	} );
}
