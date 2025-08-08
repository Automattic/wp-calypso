import wpcom from 'calypso/lib/wp';
import type { DomainSummary } from './domains';

export interface Domain extends DomainSummary {}

export function fetchDomain( domainName: string ): Promise< Domain > {
	return wpcom.req.get( {
		path: `/domain-details/${ domainName }`,
		apiVersion: '1.2',
	} );
}
