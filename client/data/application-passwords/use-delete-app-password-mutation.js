import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';

const useDeleteAppPasswordMutation = ( queryOptions = {} ) => {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: ( { appPasswordId } ) =>
			wp.req.post( `/me/two-step/application-passwords/${ appPasswordId }/delete` ),
		...queryOptions,
		onSuccess( ...args ) {
			queryClient.invalidateQueries( {
				queryKey: [ 'application-passwords' ],
			} );
			queryOptions.onSuccess?.( ...args );
		},
	} );

	const { mutate } = mutation;

	const deleteAppPassword = useCallback(
		( appPasswordId ) => mutate( { appPasswordId } ),
		[ mutate ]
	);

	return { deleteAppPassword, ...mutation };
};

export default useDeleteAppPasswordMutation;
