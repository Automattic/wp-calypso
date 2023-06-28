import { useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';

export function useDomainIsAvailable( domain: string, queryOptions = {} ) {
	return useQuery( {
		queryKey: [ 'domain-availability-check', domain ],
		queryFn: () =>
			wpcomRequest( {
				apiVersion: '1.3',
				path: `/domains/${ encodeURIComponent( domain ) }/is-available`,
			} ),
		staleTime: 5 * 60 * 1000,
		keepPreviousData: true,
		...queryOptions,
	} );
}
