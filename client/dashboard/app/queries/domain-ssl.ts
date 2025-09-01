import { fetchSslDetails, provisionSslCertificate } from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from '../query-client';

export const sslDetailsQuery = ( domainName: string ) =>
	queryOptions( {
		queryKey: [ 'domains', domainName, 'ssl' ],
		queryFn: () => fetchSslDetails( domainName ),
	} );

export const provisionSslCertificateMutation = ( domainName: string ) =>
	mutationOptions( {
		mutationFn: () => provisionSslCertificate( domainName ),
		onSuccess: () => {
			queryClient.invalidateQueries( sslDetailsQuery( domainName ) );
		},
	} );
