import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';

const useCreateAppPasswordMutation = ( queryOptions = {} ) => {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: ( { appName } ) =>
			wp.req.post( '/me/two-step/application-passwords/new', {
				application_name: appName,
			} ),
		...queryOptions,
		onSuccess( ...args ) {
			queryClient.invalidateQueries( {
				queryKey: [ 'application-passwords' ],
			} );
			queryOptions.onSuccess?.( ...args );
		},
	} );

	const { mutate } = mutation;

	const createApplicationPassword = useCallback( ( appName ) => mutate( { appName } ), [ mutate ] );

	return { createApplicationPassword, ...mutation };
};

export default useCreateAppPasswordMutation;
