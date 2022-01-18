import { useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import wp from 'calypso/lib/wp';
import { getCacheKey } from './use-user-query';

function useUpdateUserMutation( siteId, queryOptions = {} ) {
	const queryClient = useQueryClient();
	const mutation = useMutation(
		( { userId, variables } ) => wp.req.post( `/sites/${ siteId }/users/${ userId }`, variables ),
		{
			...queryOptions,
			onSuccess( data, ...rest ) {
				queryClient.setQueryData( getCacheKey( siteId, data.login ), data );
				queryOptions.onSuccess?.( data, ...rest );
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
