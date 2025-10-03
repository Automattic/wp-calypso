import { wpcom } from '../wpcom-fetcher';
import type { DomainSummary } from './types';

export async function fetchDomains(): Promise< DomainSummary[] > {
	const { domains } = await wpcom.req.get( '/all-domains', {
		no_wpcom: true,
		resolve_status: true,
	} );
	return domains;
}
