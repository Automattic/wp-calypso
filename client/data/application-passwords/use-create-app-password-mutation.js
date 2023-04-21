import { useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import wp from 'calypso/lib/wp';

const useCreateAppPasswordMutation = ( queryOptions = {} ) => {
	const queryClient = useQueryClient();
	const mutation = useMutation(
		( { appName } ) =>
			wp.req.post( '/me/two-step/application-passwords/new', {
				application_name: appName,
			} ),
		{
			...queryOptions,
			onSuccess( ...args ) {
				queryClient.invalidateQueries( [ 'application-passwords' ] );
				queryOptions.onSuccess?.( ...args );
			},
		}
	);

	const { mutate } = mutation;

	const createApplicationPassword = useCallback( ( appName ) => mutate( { appName } ), [ mutate ] );

	return { createApplicationPassword, ...mutation };
};

export default useCreateAppPasswordMutation;
