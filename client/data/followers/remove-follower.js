/**
 * External dependencies
 */
import { useMutation, useQueryClient } from 'react-query';

/**
 * Internal dependencies
 */
import wp from 'calypso/lib/wp';

function useRemoveFollower() {
	const queryClient = useQueryClient();
	const { mutate: removeFollower, ...rest } = useMutation(
		( { siteId, follower, type } ) => {
			const method = type === 'email' ? 'removeEmailFollower' : 'removeFollower';
			return wp.undocumented().site( siteId )[ method ]( follower.ID );
		},
		{
			onSuccess( data, variables ) {
				const { siteId, type } = variables;
				queryClient.invalidateQueries( [ 'followers', siteId, type ] );
			},
		}
	);

	return { removeFollower, ...rest };
}

export default useRemoveFollower;
