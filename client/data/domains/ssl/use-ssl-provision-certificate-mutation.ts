import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { useCallback } from 'react';
import { sslDetailsQueryKey } from 'calypso/data/domains/ssl/ssl-details-query-key';
import wp from 'calypso/lib/wp';
import type { SslDetailsResponse } from './use-ssl-details-query';
import type { DomainsApiError } from 'calypso/lib/domains/types';

export default function useProvisionCertificateMutation(
	domainName: string,
	queryOptions: {
		onSuccess?: () => void;
		onError?: ( error: DomainsApiError ) => void;
	}
) {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: () =>
			wp.req
				.post( {
					path: `/domains/ssl/${ domainName }`,
					apiNamespace: 'wpcom/v2',
				} )
				.then( () => {} ),
		...queryOptions,
		onSuccess( response: SslDetailsResponse ) {
			const key = sslDetailsQueryKey( domainName );
			queryClient.setQueryData( key, () => {
				return response.data;
			} );
			queryOptions.onSuccess?.();
		},
		onError( error: DomainsApiError ) {
			queryOptions.onError?.( error );
		},
	} );

	return { provisionCertificate: mutation.mutate, ...mutation };
}
