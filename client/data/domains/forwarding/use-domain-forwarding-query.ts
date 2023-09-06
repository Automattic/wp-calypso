import { UseQueryResult, useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { domainForwardingQueryKey } from './domain-forwarding-query-key';

export type DomainForwardingObject = {
	domain_redirect_id: number;
	domain: string;
	subdomain: string;
	target_host: string;
	target_path: string;
	forward_paths: true | false;
	is_secure: true | false;
	is_permanent: true | false;
	is_active?: true | false;
	source_path?: string;
};

const selectForwards = (
	response: DomainForwardingObject[] | null
): DomainForwardingObject[] | null => {
	if ( ! response ) {
		return null;
	}

	return response?.map( ( forwarding: DomainForwardingObject ) => {
		return forwarding;
	} );
};

export default function useDomainForwardingQuery(
	domainName: string
): UseQueryResult< DomainForwardingObject[] | null > {
	return useQuery( {
		queryKey: domainForwardingQueryKey( domainName ),
		queryFn: () => wp.req.get( `/sites/all/domain/${ domainName }/redirects?new-endpoint=true` ),
		refetchOnWindowFocus: false,
		select: selectForwards,
	} );
}
