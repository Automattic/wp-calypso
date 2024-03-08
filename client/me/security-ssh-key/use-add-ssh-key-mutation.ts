import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';
import { SSH_KEY_QUERY_KEY } from './use-ssh-key-query';

interface MutationVariables {
	name: string;
	key: string;
}

interface MutationResponse {
	message: string;
}

interface MutationError {
	code: string;
	message: string;
}

export const useAddSSHKeyMutation = (
	options: UseMutationOptions< MutationResponse, MutationError, MutationVariables > = {}
) => {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: async ( { name, key }: MutationVariables ) =>
			wp.req.post(
				{ path: '/me/ssh-keys', apiNamespace: 'wpcom/v2' },
				{
					name,
					key,
				}
			),
		...options,
		onSuccess: async ( ...args ) => {
			await queryClient.invalidateQueries( { queryKey: SSH_KEY_QUERY_KEY } );
			options.onSuccess?.( ...args );
		},
	} );

	const { mutate, isPending } = mutation;

	const addSSHKey = useCallback( ( args: MutationVariables ) => mutate( args ), [ mutate ] );

	return { addSSHKey, isPending };
};
