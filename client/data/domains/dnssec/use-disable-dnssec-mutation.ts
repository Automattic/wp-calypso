import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';

interface Variables {
	domain: string;
}

export default function useDisableDnssecMutation( queryOptions: {
	onSuccess?: () => void;
	onError?: ( error: any ) => void;
} ) {
	const mutation = useMutation( {
		mutationFn: async ( { domain }: Variables ) => {
			return wp.req.post( {
				method: 'DELETE',
				path: `/domains/dnssec/${ domain }`,
				apiNamespace: 'wpcom/v2',
			} );
		},
		...queryOptions,
	} );

	const { mutate } = mutation;

	const disableDnssec = useCallback( ( domain: string ) => mutate( { domain } ), [ mutate ] );

	return { disableDnssec, ...mutation };
}
