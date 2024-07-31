import { UseQueryResult, useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { domainSSLStatusQueryKey } from './domain-ssl-status-query-key';

export type SSLStatus = {
	certificate_provisioned: boolean;
	certificate_expiry_date?: string;
	last_attempt?: string;
	next_attempt?: string;
	failure_reason?: string;
};

export default function useDomainSSLStatusQuery( domainName: string ): UseQueryResult< SSLStatus > {
	return useQuery( {
		queryKey: domainSSLStatusQueryKey( domainName ),
		queryFn: () =>
			wp.req.get( {
				path: `/domains/ssl/${ domainName }`,
				apiNamespace: 'wpcom/v2',
			} ),
		refetchOnWindowFocus: false,
		enabled: false,
		staleTime: 5 * 60 * 1000,
		gcTime: 5 * 60 * 1000,
	} );
}
