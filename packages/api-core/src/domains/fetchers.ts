import { wpcom } from '../wpcom-fetcher';
import type { BulkDomainUpdateStatusQueryFnData, DomainSummary } from './types';

export async function fetchDomains(): Promise< DomainSummary[] > {
	const { domains } = await wpcom.req.get( { path: '/all-domains', apiVersion: '1.2' } );
	return domains;
}

export async function fetchBulkDomainUpdateStatus(): Promise< BulkDomainUpdateStatusQueryFnData > {
	return wpcom.req.get( {
		path: '/domains/bulk-actions',
		apiNamespace: 'wpcom/v2',
	} );
}
