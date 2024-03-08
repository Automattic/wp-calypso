import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { DomainsApiError } from 'calypso/lib/domains/types';
import wp from 'calypso/lib/wp';
import { domainTransferRequestQueryKey } from './domain-transfer-request-query-key';

export default function useDomainTransferRequestUpdate(
	siteSlug: string,
	domainName: string,
	queryOptions: {
		onSuccess?: () => void;
		onError?: ( error: DomainsApiError ) => void;
	}
) {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: ( email: string ) =>
			wp.req.post( `/sites/${ siteSlug }/domains/${ domainName }/transfer-to-any-user`, {
				email,
			} ),
		...queryOptions,
		onSuccess() {
			queryClient.invalidateQueries( {
				queryKey: domainTransferRequestQueryKey( siteSlug, domainName ),
			} );
			queryOptions.onSuccess?.();
		},
	} );

	const { mutate } = mutation;

	const domainTransferRequestUpdate = useCallback(
		( email: string ) => mutate( email ),
		[ mutate ]
	);

	return { domainTransferRequestUpdate, ...mutation };
}
