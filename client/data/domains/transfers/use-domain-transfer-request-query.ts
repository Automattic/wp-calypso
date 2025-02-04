import { UseQueryResult, useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { domainTransferRequestQueryKey } from './domain-transfer-request-query-key';

export type DomainTransferRequest = {
	email: string;
	requested_at: string;
};

export default function useDomainTransferRequestQuery(
	siteSlug: string,
	domainName: string
): UseQueryResult< DomainTransferRequest | null > {
	return useQuery( {
		queryKey: domainTransferRequestQueryKey( siteSlug, domainName ),
		queryFn: () =>
			wp.req.get( `/sites/${ siteSlug }/domains/${ domainName }/transfer-to-any-user` ),
		refetchOnWindowFocus: false,
		select: ( data: DomainTransferRequest ) => data,
	} );
}
