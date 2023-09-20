import { type AllDomainsQueryFnData, useAllDomainsQuery } from '@automattic/data-stores';
import type { UseQueryOptions } from '@tanstack/react-query';

export function useDomainsTable( options: UseQueryOptions< AllDomainsQueryFnData > = {} ) {
	const { data, ...queryResult } = useAllDomainsQuery( { no_wpcom: true }, options );

	return { ...queryResult, domains: data?.domains };
}
