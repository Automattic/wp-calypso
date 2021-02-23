/**
 * External dependencies
 */
import { useMutation, useQueryClient } from 'react-query';

/**
 * Internal dependencies
 */
import wp from 'calypso/lib/wp';

export const cacheKey = ( siteId, login ) => [ 'user', siteId, login ];

function useUpdateUser( siteId, login ) {
	const queryClient = useQueryClient();
	const { mutate: updateUser, ...rest } = useMutation(
		( { userId, variables } ) => wp.undocumented().site( siteId ).updateUser( userId, variables ),
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

	return { updateUser, ...rest };
}

export default useUpdateUser;
