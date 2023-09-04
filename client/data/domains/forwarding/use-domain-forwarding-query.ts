import { UseQueryResult, useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { domainForwardingQueryKey } from './domain-forwarding-query-key';

export type DomainForwardingObject = {
	domain_redirect_id: number;
	domain: string;
	subdomain: string;
	target_host: string;
	target_path: string;
	forward_paths: '0' | '1' | true | false;
	is_secure: '0' | '1' | true | false;
	is_permanent: '0' | '1' | true | false;
	is_active: '0' | '1' | true | false;
	source_path: string;
};

const selectForwards = (
	response: DomainForwardingObject[] | null
): DomainForwardingObject[] | null => {
	if ( ! response ) {
		return null;
	}

	return response?.map( ( forwarding: DomainForwardingObject ) => {
		return {
			...forwarding,
			forward_paths: forwarding.forward_paths === '1',
			is_secure: forwarding.is_secure === '1',
			is_permanent: forwarding.is_permanent === '1',
			is_active: forwarding.is_active === '1',
		};
	} );
};

export default function useDomainForwardingQuery(
	domainName: string
): UseQueryResult< DomainForwardingObject[] | null > {
	return useQuery( {
		queryKey: domainForwardingQueryKey( domainName ),
		queryFn: () => wp.req.get( `/sites/all/domain/${ domainName }/redirects` ),
		refetchOnWindowFocus: false,
		select: selectForwards,
	} );
}
