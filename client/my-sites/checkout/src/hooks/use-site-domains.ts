import { siteDomainsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { createSiteDomainObject } from 'calypso/state/sites/domains/assembler';
import type { Domain } from '@automattic/api-core';
import type { ResponseDomain } from 'calypso/lib/domains/types';

const EMPTY_SITE_DOMAINS: ResponseDomain[] = [];

const selectSiteDomains = ( domains: Domain[] ): ResponseDomain[] =>
	domains.map( createSiteDomainObject );

export default function useSiteDomains( siteId: number | undefined ): ResponseDomain[] {
	const { data } = useQuery( {
		...siteDomainsQuery( siteId ?? 0 ),
		enabled: !! siteId,
		select: selectSiteDomains,
	} );

	return data ?? EMPTY_SITE_DOMAINS;
}
