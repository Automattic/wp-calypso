import { useCallback } from 'react';
import { useMutation, UseMutationOptions, useQueryClient } from 'react-query';
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

export const useUpdateSSHKeyMutation = (
	options: UseMutationOptions< MutationResponse, MutationError, MutationVariables > = {}
) => {
	const queryClient = useQueryClient();
	const mutation = useMutation(
		async ( { name, key }: MutationVariables ) =>
			wp.req.put(
				{
					path: '/me/ssh-keys',
					apiNamespace: 'wpcom/v2',

					method: 'PUT',
				},
				{
					name,
					key,
				}
			),
		{
			...options,
			onSuccess: async ( ...args ) => {
				await queryClient.invalidateQueries( SSH_KEY_QUERY_KEY );
				options.onSuccess?.( ...args );
			},
		}
	);

	const { mutate, isLoading } = mutation;

	const updateSSHKey = useCallback( ( args: MutationVariables ) => mutate( args ), [ mutate ] );

	return { updateSSHKey, isLoading };
};
