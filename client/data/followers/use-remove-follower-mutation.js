import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';

function useRemoveFollowerMutation() {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: ( { siteId, type, followerId } ) => {
			const typeSlug = type === 'email' ? 'email-followers' : 'followers';
			return wp.req.post( `/sites/${ siteId }/${ typeSlug }/${ followerId }/delete` );
		},
		onSuccess( data, variables ) {
			const { siteId, type } = variables;
			queryClient.invalidateQueries( {
				queryKey: [ 'followers', siteId, type ],
			} );
		},
	} );
	const { mutate } = mutation;
	const removeFollower = useCallback(
		( siteId, type, followerId ) => mutate( { siteId, type, followerId } ),
		[ mutate ]
	);

	return { removeFollower, ...mutation };
}

export default useRemoveFollowerMutation;
