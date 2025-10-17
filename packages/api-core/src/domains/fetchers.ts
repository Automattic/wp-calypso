import { wpcom } from '../wpcom-fetcher';
import type { DomainSummary } from './types';

export async function fetchDomains(): Promise< DomainSummary[] > {
	const { domains } = await wpcom.req.get(
		{ path: '/all-domains', apiVersion: '1.2' },
		{
			no_wpcom: true,
			resolve_status: true,
		}
	);
	return domains;
}
