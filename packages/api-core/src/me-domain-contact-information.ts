import { wpcom } from './wpcom-fetcher';
import type {
	ContactValidationRequestContactInformation,
	DomainContactValidationRequest,
	RawCachedDomainContactDetails,
	RawDomainContactValidationResponse,
} from './domain-whois/types';

export async function fetchDomainContactInformation(): Promise< RawCachedDomainContactDetails > {
	return await wpcom.req.get( '/me/domain-contact-information' );
}

export async function updateDomainContactInformation(
	request: DomainContactValidationRequest
): Promise< void > {
	await wpcom.req.post( { path: '/me/domain-contact-information', body: request } );
}

/**
 * Validate contact details for registering the given domains.
 *
 * Unlike `validateDomainWhois`, this uses v1.2, which qualifies the keys of
 * errors on nested fields (`extra.ca.lang` rather than `lang`) so they can be
 * mapped back onto the form field that caused them.
 */
export async function validateDomainContactInformation(
	contactInformation: ContactValidationRequestContactInformation,
	domainNames: string[]
): Promise< RawDomainContactValidationResponse > {
	return await wpcom.req.post( {
		path: '/me/domain-contact-information/validate',
		apiVersion: '1.2',
		body: {
			contact_information: contactInformation,
			domain_names: domainNames,
		},
	} );
}

export async function validateGoogleWorkspaceContactInformation(
	contactInformation: ContactValidationRequestContactInformation,
	domainNames: string[]
): Promise< RawDomainContactValidationResponse > {
	return await wpcom.req.post( {
		path: '/me/google-apps/validate',
		body: {
			contact_information: contactInformation,
			domain_names: domainNames,
		},
	} );
}
