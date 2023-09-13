import { useAllDomainsQuery } from '@automattic/data-stores';

export function useDomainsTable() {
	const { data, ...queryResult } = useAllDomainsQuery( { no_wpcom: true } );

	return { ...queryResult, domains: data?.domains };
}
