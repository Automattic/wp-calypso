/**
 * External dependencies
 */
import { useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';

/**
 * Internal dependencies
 */
import wp from 'calypso/lib/wp';

function useDeleteUserMutation( siteId ) {
	const queryClient = useQueryClient();
	const mutation = useMutation(
		( { userId, variables } ) =>
			wp.req.post( `/sites/${ siteId }/users/${ userId }/delete`, variables ),
		{
			onSuccess() {
				queryClient.invalidateQueries( [ 'users', siteId ] );
			},
		}
	);

	const { mutate } = mutation;

	const deleteUser = useCallback(
		( userId, variables ) => {
			mutate( { userId, variables } );
		},
		[ mutate ]
	);

	return { deleteUser, ...mutation };
}

export default useDeleteUserMutation;
