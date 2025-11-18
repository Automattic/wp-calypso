import { wpcom } from '../wpcom-fetcher';
import type { DomainPropagationStatus } from './types';

export async function fetchDomainPropagationStatus(
	domainName: string
): Promise< DomainPropagationStatus > {
	return wpcom.req.get( {
		path: `/domains/propagation-status/${ domainName }`,
		apiNamespace: 'wpcom/v2',
	} );
}
