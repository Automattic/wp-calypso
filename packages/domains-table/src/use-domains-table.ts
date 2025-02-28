import {
	type AllDomainsQueryFnData,
	useAllDomainsQuery,
	type AllDomainsQueryArgs,
} from '@automattic/data-stores';

export function useDomainsTable(
	fetchAllDomains?: ( queryArgs?: AllDomainsQueryArgs ) => Promise< AllDomainsQueryFnData >
) {
	const queryArgs = { no_wpcom: true, resolve_status: true };

	const { data, ...queryResult } = useAllDomainsQuery(
		queryArgs,
		fetchAllDomains && { queryFn: () => fetchAllDomains( queryArgs ) }
	);

	return { ...queryResult, domains: data?.domains };
}
