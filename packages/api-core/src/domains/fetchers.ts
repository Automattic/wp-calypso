import { wpcom } from '../wpcom-fetcher';
import type { BulkDomainUpdateStatusQueryFnData, DomainSummary } from './types';

export interface FetchDomainsOptions {
	garden?: string;
}

export async function fetchDomains( options?: FetchDomainsOptions ): Promise< DomainSummary[] > {
	const queryParams: Record< string, string > = {};
	if ( options?.garden ) {
		queryParams.garden = options.garden;
	}
	const { domains } = await wpcom.req.get(
		{ path: '/all-domains', apiVersion: '1.2' },
		queryParams
	);
	return domains;
}

export async function fetchBulkDomainUpdateStatus(): Promise< BulkDomainUpdateStatusQueryFnData > {
	return wpcom.req.get( {
		path: '/domains/bulk-actions',
		apiNamespace: 'wpcom/v2',
	} );
}
