import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';

interface Variables {
	domain: string;
}

export default function useEnableDnssecMutation( queryOptions: {
	onSuccess?: ( success: any ) => void;
	onError?: ( error: any ) => void;
} ) {
	const mutation = useMutation( {
		mutationFn: ( { domain }: Variables ) => {
			return wp.req.post( {
				path: `/domains/dnssec/${ domain }`,
				apiNamespace: 'wpcom/v2',
			} );
		},
		...queryOptions,
	} );

	const { mutate } = mutation;

	const enableDnssec = useCallback( ( domain: string ) => mutate( { domain } ), [ mutate ] );

	return { enableDnssec, ...mutation };
}
