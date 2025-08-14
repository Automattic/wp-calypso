import wpcom from 'calypso/lib/wp';
import type { DomainSummary } from './domains';

export interface Domain extends DomainSummary {
	is_gravatar_domain: boolean;
}

export function fetchDomain( domainName: string ): Promise< Domain > {
	return wpcom.req.get( {
		path: `/domain-details/${ domainName }`,
		apiVersion: '1.2',
	} );
}

export async function fetchCountryList(): Promise< CountryListItem[] > {
	return await wpcom.req.get( {
		path: '/domains/supported-countries',
		apiVersion: '1.1',
	} );
}
