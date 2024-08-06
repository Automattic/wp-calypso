import { UseQueryResult, useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { domainSSLDetailsQueryKey } from './domain-ssl-details-query-key';

export type DnsRawRecord = {
	host: string;
	class: string;
	type: string;
	ttl: number;
	target?: string;
	ip?: string;
};

export type SSLFailureReason = {
	error_type: string;
	message: string;
	records: DnsRawRecord[];
};

export type SSLDetails = {
	certificate_provisioned: boolean;
	certificate_expiry_date?: string;
	last_attempt?: string;
	next_attempt?: string;
	failure_reasons?: SSLFailureReason[];
	is_newly_registered: boolean;
};

export type SSLDetailsResponse = {
	data: SSLDetails;
	status?: string;
	error?: string;
};

export default function useDomainSSLDetailsQuery(
	domainName: string
): UseQueryResult< SSLDetailsResponse > {
	return useQuery( {
		queryKey: domainSSLDetailsQueryKey( domainName ),
		queryFn: () =>
			wp.req.get( {
				path: `/domains/ssl/${ domainName }`,
				apiNamespace: 'wpcom/v2',
			} ),
		refetchOnWindowFocus: false,
		enabled: false,
		// staleTime: 5 * 60 * 1000,
		// gcTime: 5 * 60 * 1000,
		staleTime: 5000,
		gcTime: 5000,
	} );
}
