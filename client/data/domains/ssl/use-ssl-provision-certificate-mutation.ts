import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sslDetailsQueryKey } from 'calypso/data/domains/ssl/ssl-details-query-key';
import wp from 'calypso/lib/wp';
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
		onSuccess() {
			const key = sslDetailsQueryKey( domainName );
			queryClient.invalidateQueries( { queryKey: key } );
			queryOptions.onSuccess?.();
		},
		onError( error: DomainsApiError ) {
			queryOptions.onError?.( error );
		},
	} );

	return { provisionCertificate: mutation.mutate, ...mutation };
}
