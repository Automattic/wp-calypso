/**
 * External dependencies
 */
import { useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';

/**
 * Internal dependencies
 */
import wp from 'calypso/lib/wp';

export const cacheKey = ( siteId, login ) => [ 'user', siteId, login ];

function useUpdateUserMutation( siteId, login ) {
	const queryClient = useQueryClient();
	const { mutate, ...mutationObj } = useMutation(
		( { userId, variables } ) => wp.req.post( `/sites/${ siteId }/users/${ userId }`, variables ),
		{
			// optimistically update user
			async onMutate( { variables } ) {
				await queryClient.cancelQueries( cacheKey( siteId, login ) );

				const previousUser = queryClient.getQueryData( cacheKey( siteId, login ) );

				queryClient.setQueryData( cacheKey( siteId, login ), ( old ) => ( {
					...old,
					...variables,
				} ) );

				return { previousUser };
			},
			onError( error, updatedUser, context ) {
				queryClient.setQueryData( cacheKey( siteId, login ), context.previousUser );
			},
			onSuccess( userData ) {
				queryClient.setQueryData( cacheKey( siteId, login ), userData );
			},
		}
	);

	const updateUser = useCallback(
		( userId, variables = {} ) => {
			mutate( { userId, variables } );
		},
		[ mutate ]
	);

	return { updateUser, mutate, ...mutationObj };
}

export default useUpdateUserMutation;
