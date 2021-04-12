/**
 * External dependencies
 */
import { useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';

/**
 * Internal dependencies
 */
import wp from 'calypso/lib/wp';
import { cacheKey } from './use-user-query';

function useUpdateUserMutation( siteId ) {
	const queryClient = useQueryClient();
	const mutation = useMutation(
		( { userId, variables } ) => wp.req.post( `/sites/${ siteId }/users/${ userId }`, variables ),
		{
			onSuccess( data ) {
				const { login } = data;
				queryClient.invalidateQueries( cacheKey( siteId, login ) );
			},
		}
	);

	const { mutate } = mutation;

	const updateUser = useCallback(
		( userId, variables = {} ) => {
			mutate( { userId, variables } );
		},
		[ mutate ]
	);

	return { updateUser, ...mutation };
}

export default useUpdateUserMutation;
