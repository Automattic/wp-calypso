/**
 * External dependencies
 */
import { useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';

/**
 * Internal dependencies
 */
import wp from 'calypso/lib/wp';

function useRemoveFollowerMutation() {
	const queryClient = useQueryClient();
	const { mutate, ...mutationObj } = useMutation(
		( { siteId, type, followerId } ) => {
			const method = type === 'email' ? 'removeEmailFollower' : 'removeFollower';
			return wp.undocumented().site( siteId )[ method ]( followerId );
		},
		{
			onSuccess( data, variables ) {
				const { siteId, type } = variables;
				queryClient.invalidateQueries( [ 'followers', siteId, type ] );
			},
		}
	);

	const removeFollower = useCallback(
		( siteId, type, followerId ) =>
			mutate( {
				siteId,
				type,
				followerId,
			} ),
		[ mutate ]
	);

	return { removeFollower, mutate, ...mutationObj };
}

export default useRemoveFollowerMutation;
