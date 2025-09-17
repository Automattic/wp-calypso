import { wpcom } from '../wpcom-fetcher';
import type { DomainPrivacyResponse } from './types';

export function enableDomainPrivacy( domainName: string ): Promise< DomainPrivacyResponse > {
	return wpcom.req.post( {
		path: `/domains/${ domainName }/privacy/enable`,
		apiVersion: '1.1',
	} );
}

export function disableDomainPrivacy( domainName: string ): Promise< DomainPrivacyResponse > {
	return wpcom.req.post( {
		path: `/domains/${ domainName }/privacy/disable`,
		apiVersion: '1.1',
	} );
}

export function discloseDomainPrivacy( domainName: string ): Promise< DomainPrivacyResponse > {
	return wpcom.req.post( {
		path: `/domains/${ domainName }/privacy/disclose`,
		apiVersion: '1.1',
	} );
}

export function redactDomainPrivacy( domainName: string ): Promise< DomainPrivacyResponse > {
	return wpcom.req.post( {
		path: `/domains/${ domainName }/privacy/redact`,
		apiVersion: '1.1',
	} );
}
