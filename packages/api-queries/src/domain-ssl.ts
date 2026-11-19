import { fetchSslDetails, provisionSslCertificate } from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { domainQuery } from './domain';
import { queryClient } from './query-client';

export const sslDetailsQuery = ( domainName: string ) =>
	queryOptions( {
		queryKey: [ 'domains', domainName, 'ssl' ],
		queryFn: () => fetchSslDetails( domainName ),
	} );

export const provisionSslCertificateMutation = ( domainName: string ) =>
	mutationOptions( {
		meta: { statId: 'domain-ssl-provision' },
		mutationFn: () => provisionSslCertificate( domainName ),
		onSettled: () => {
			queryClient.invalidateQueries( sslDetailsQuery( domainName ) );
			queryClient.invalidateQueries( { ...domainQuery( domainName ), exact: true } );
		},
	} );
