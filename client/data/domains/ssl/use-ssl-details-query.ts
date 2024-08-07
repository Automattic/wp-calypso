import { UseQueryResult, useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { sslDetailsQueryKey } from './ssl-details-query-key';

export type DnsRawRecord = {
	host: string;
	class: string;
	type: string;
	ttl: number;
	target?: string;
	ip?: string;
};

export type SslFailureReason = {
	error_type: string;
	message: string;
	records: DnsRawRecord[];
};

export type SslDetails = {
	certificate_provisioned: boolean;
	certificate_expiry_date?: string;
	last_attempt?: string;
	next_attempt?: string;
	failure_reasons?: SslFailureReason[];
	is_newly_registered: boolean;
};

export type SslDetailsResponse = {
	data: SslDetails;
	status: string;
};

export default function useSslDetailsQuery( domainName: string ): UseQueryResult< SslDetails > {
	return useQuery( {
		queryKey: sslDetailsQueryKey( domainName ),
		queryFn: () =>
			wp.req.get( {
				path: `/domains/ssl/${ domainName }`,
				apiNamespace: 'wpcom/v2',
			} ),
		refetchOnWindowFocus: false,
		enabled: false,
		staleTime: 5 * 60 * 1000,
		gcTime: 5 * 60 * 1000,
		select: ( response: SslDetailsResponse ) => response.data,
	} );
}
