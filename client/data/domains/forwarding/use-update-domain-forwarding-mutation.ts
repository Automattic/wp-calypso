import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { DomainsApiError } from 'calypso/lib/domains/types';
import wp from 'calypso/lib/wp';
import { domainForwardingQueryKey } from './domain-forwarding-query-key';
import { DomainForwardingObject } from './use-domain-forwarding-query';

export default function useUpdateDomainForwardingMutation(
	domainName: string,
	queryOptions: {
		onSuccess?: () => void;
		onError?: ( error: DomainsApiError ) => void;
	}
) {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: ( forwarding: DomainForwardingObject ) =>
			wp.req.post( `/sites/all/domain/${ domainName }/redirects`, forwarding ),
		...queryOptions,
		onSuccess() {
			queryClient.invalidateQueries( domainForwardingQueryKey( domainName ) );
			queryOptions.onSuccess?.();
		},
		onError( error: DomainsApiError ) {
			queryOptions.onError?.( error );
		},
	} );

	const { mutate } = mutation;

	const updateDomainForwarding = useCallback(
		( forwarding: DomainForwardingObject ) => mutate( forwarding ),
		[ mutate ]
	);

	return { updateDomainForwarding, ...mutation };
}
