import { useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';

type DomainCodeResponse = {
	success: boolean;
};

type DomainCodePair = { domain: string; auth: string };

const key = ( domain: DomainCodePair ) => [ domain.domain, domain.auth ].join( ':' );

export function useIsDomainCodeValid( pair: DomainCodePair, queryOptions = {} ) {
	return useQuery( {
		queryKey: [ 'domain-code-valid', key( pair ) ],
		queryFn: () =>
			wpcomRequest< DomainCodeResponse >( {
				apiVersion: '1.1',
				path: `/domains/${ encodeURIComponent( pair.domain ) }/inbound-transfer-check-auth-code`,
				query: `auth_code=${ encodeURIComponent( pair.auth ) }`,
			} ),
		staleTime: 5 * 60 * 1000,
		keepPreviousData: true,
		...queryOptions,
	} );
}
