import { useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import wp from 'calypso/lib/wp';

const useDeleteAppPasswordMutation = ( queryOptions = {} ) => {
	const queryClient = useQueryClient();
	const mutation = useMutation(
		( { appPasswordId } ) =>
			wp.req.post( `/me/two-step/application-passwords/${ appPasswordId }/delete` ),
		{
			...queryOptions,
			onSuccess( ...args ) {
				queryClient.invalidateQueries( [ 'application-passwords' ] );
				queryOptions.onSuccess?.( ...args );
			},
		}
	);

	const { mutate } = mutation;

	const deleteAppPassword = useCallback( ( appPasswordId ) => mutate( { appPasswordId } ), [
		mutate,
	] );

	return { deleteAppPassword, ...mutation };
};

export default useDeleteAppPasswordMutation;
