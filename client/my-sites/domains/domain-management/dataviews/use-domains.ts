import { createSiteDomainObject } from '@automattic/domains-table/src/utils/assembler';
import { useQuery } from '@tanstack/react-query';
import { addQueryArgs } from '@wordpress/url';
import { map } from 'lodash';
import wpcom from 'calypso/lib/wp';
import { DomainData, DomainsQueryArgs, DomainsQueryFnData } from './types';

export const getDomainsQueryKey = ( queryArgs: DomainsQueryArgs = {} ) => [
	'all-domains',
	queryArgs,
];

async function fetchDomains( queryArgs: DomainsQueryArgs ): Promise< DomainsQueryFnData > {
	return wpcom.req.get( {
		path: addQueryArgs( '/all-domains', queryArgs ),
		apiVersion: '1.1',
	} );
}

export const useDomainsQuery = ( queryArgs: DomainsQueryArgs = {} ) => {
	return useQuery( {
		queryKey: getDomainsQueryKey( queryArgs ),
		queryFn: () => fetchDomains( queryArgs ),
	} );
};

export function useDomains() {
	const queryArgs = { no_wpcom: true, resolve_status: true, extended_data: true };
	const { data, ...queryResult } = useDomainsQuery( queryArgs );
	return {
		...queryResult,
		domains: map( data?.domains ?? [], ( d ) => {
			return {
				original: d,
				processed: createSiteDomainObject( d ),
			} as DomainData;
		} ),
	};
}

export function getDomainId( domain: DomainData ): string {
	return domain.processed.domain + domain.processed.blogId;
}
