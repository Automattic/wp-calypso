/**
 * External dependencies
 */
import { useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';

/**
 * Internal dependencies
 */
import wp from 'calypso/lib/wp';

function useUpdateNameserversMutation( domainName ) {
	const queryClient = useQueryClient();
	const mutation = useMutation(
		( { nameservers } ) =>
			wp.req.post( `/domains/${ domainName }/nameservers`, {
				nameservers: nameservers.map( ( nameserver ) => ( { nameserver } ) ),
			} ),
		{
			onSuccess() {
				queryClient.invalidateQueries( [ 'domain-nameservers', domainName ] );
			},
		}
	);

	const { mutate } = mutation;

	const updateNameservers = useCallback( ( nameservers ) => mutate( { nameservers } ), [ mutate ] );

	return { updateNameservers, ...mutation };
}

export default useUpdateNameserversMutation;
