import {
	type BulkDomainUpdateStatusQueryFnData,
	type BulkDomainUpdateStatusResult,
} from '@automattic/api-core';
import { bulkDomainUpdateStatusQuery } from '@automattic/api-queries';
import { type UseQueryOptions, useQuery } from '@tanstack/react-query';

export const getBulkDomainUpdateStatusQueryKey = () => {
	return bulkDomainUpdateStatusQuery().queryKey;
};

export function useBulkDomainUpdateStatusQuery(
	pollingInterval: number,
	options: Omit<
		UseQueryOptions<
			BulkDomainUpdateStatusQueryFnData,
			Error,
			BulkDomainUpdateStatusResult,
			string[]
		>,
		'queryKey'
	> = {}
) {
	return useQuery( {
		...bulkDomainUpdateStatusQuery(),
		refetchInterval: pollingInterval,
		...options,
	} );
}
