import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { DomainsApiError } from 'calypso/lib/domains/types';
import wp from 'calypso/lib/wp';

export default function useSendDomainTransferRequestMutation(
	domainName: string,
	queryOptions: {
		onSuccess?: () => void;
		onError?: ( error: DomainsApiError ) => void;
	}
) {
	const mutation = useMutation( {
		mutationFn: ( emailAddress: string ) =>
			wp.req.post( `/sites/all/domain/${ domainName }/transfer`, emailAddress ),
		...queryOptions,
		onSuccess() {
			queryOptions.onSuccess?.();
		},
	} );

	const { mutate } = mutation;

	const sendDomainTransferRequest = useCallback(
		( emailAddress: string ) => mutate( emailAddress ),
		[ mutate ]
	);

	return { sendDomainTransferRequest, ...mutation };
}
