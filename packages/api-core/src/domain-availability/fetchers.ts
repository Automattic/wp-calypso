import { wpcom } from '../wpcom-fetcher';
import type { DomainAvailability, DomainAvailabilityQuery } from './types';

export async function fetchDomainAvailability(
	domainName: string,
	params: Partial< DomainAvailabilityQuery > = {}
) {
	const response: DomainAvailability = await wpcom.req.get(
		`/domains/${ encodeURIComponent( domainName ) }/is-available`,
		{
			...params,
			apiVersion: '1.3',
		}
	);

	return response;
}
