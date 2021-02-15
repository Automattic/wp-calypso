/**
 * External dependencies
 */
import { useMutation, useQueryClient } from 'react-query';

/**
 * Internal dependencies
 */
import wp from 'calypso/lib/wp';

function useRemoveFollower( siteId, type, search ) {
	const queryClient = useQueryClient();
	const { mutate: removeFollower, ...rest } = useMutation(
		( followerId ) => {
			const method = type === 'email' ? 'removeEmailFollower' : 'removeFollower';
			return wp.undocumented().site( siteId )[ method ]( followerId );
		},
		{
			onSuccess() {
				queryClient.invalidateQueries( [ 'followers', siteId, type, search ] );
			},
		}
	);

	return { removeFollower, ...rest };
}

export default useRemoveFollower;
