import { useMutation } from '@tanstack/react-query';
import { DomainsApiError } from 'calypso/lib/domains/types';
import wp from 'calypso/lib/wp';

export default function useDisableDnssecMutation(
	domainName: string,
	queryOptions: {
		onSuccess?: () => void;
		onError?: ( error: DomainsApiError ) => void;
	}
) {
	const mutation = useMutation( {
		mutationFn: () => {
			return wp.req.post( {
				method: 'DELETE',
				path: `/domains/dnssec/${ domainName }`,
				apiNamespace: 'wpcom/v2',
			} );
		},
		...queryOptions,
	} );

	return { disableDnssec: mutation.mutate, ...mutation };
}
