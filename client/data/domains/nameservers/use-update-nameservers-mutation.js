import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';

function useUpdateNameserversMutation( domainName, queryOptions = {} ) {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: ( { nameservers } ) =>
			wp.req.post( `/domains/${ domainName }/nameservers`, {
				nameservers: nameservers.map( ( nameserver ) => ( { nameserver } ) ),
			} ),
		...queryOptions,
		onSuccess( ...args ) {
			queryClient.invalidateQueries( {
				queryKey: [ 'domain-nameservers', domainName ],
			} );
			queryOptions.onSuccess?.( ...args );
		},
	} );

	const { mutateAsync } = mutation;

	const updateNameservers = useCallback(
		( nameservers ) => mutateAsync( { nameservers } ),
		[ mutateAsync ]
	);

	return { updateNameservers, ...mutation };
}

export default useUpdateNameserversMutation;
