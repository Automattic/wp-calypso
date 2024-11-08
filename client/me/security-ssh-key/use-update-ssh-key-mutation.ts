import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';
import { USE_ATOMIC_SSH_KEYS_QUERY_KEY } from 'calypso/sites/tools/sftp-ssh/use-atomic-ssh-keys';
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

export const useUpdateSSHKeyMutation = (
	options: UseMutationOptions< MutationResponse, MutationError, MutationVariables > = {}
) => {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: async ( { name, key }: MutationVariables ) =>
			wp.req.put(
				{
					path: `/me/ssh-keys/${ name }`,
					apiNamespace: 'wpcom/v2',

					method: 'PUT',
				},
				{
					key,
				}
			),
		...options,
		onSuccess: async ( ...args ) => {
			await queryClient.invalidateQueries( { queryKey: SSH_KEY_QUERY_KEY } );
			await queryClient.invalidateQueries( {
				queryKey: [ USE_ATOMIC_SSH_KEYS_QUERY_KEY ],
			} );
			options.onSuccess?.( ...args );
		},
	} );

	const { mutate, isPending } = mutation;

	const updateSSHKey = useCallback( ( args: MutationVariables ) => mutate( args ), [ mutate ] );

	return { updateSSHKey, isPending };
};
