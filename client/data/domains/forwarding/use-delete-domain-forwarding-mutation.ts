import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { DomainsApiError } from 'calypso/lib/domains/types';
import wp from 'calypso/lib/wp';
import { domainForwardingQueryKey } from './domain-forwarding-query-key';

export default function useDeleteDomainForwardingMutation(
	domainName: string,
	queryOptions: {
		onSuccess?: () => void;
		onError?: ( error: DomainsApiError ) => void;
	}
) {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: ( domain_redirect_id: number ) =>
			wp.req.post( `/sites/all/domain/${ domainName }/redirects/delete`, {
				domain_redirect_id,
			} ),
		...queryOptions,
		onSuccess() {
			queryClient.removeQueries( domainForwardingQueryKey( domainName ) );
			queryOptions.onSuccess?.();
		},
	} );

	const { mutate } = mutation;

	const deleteDomainForwarding = useCallback(
		( domain_redirect_id: number ) => mutate( domain_redirect_id ),
		[ mutate ]
	);

	return { deleteDomainForwarding, ...mutation };
}
