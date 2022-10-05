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

export const useAddSSHKeyMutation = (
	options: UseMutationOptions< MutationResponse, MutationError, MutationVariables > = {}
) => {
	const queryClient = useQueryClient();
	const mutation = useMutation(
		async ( { name, key }: MutationVariables ) =>
			wp.req.post(
				{ path: '/me/ssh-keys', apiNamespace: 'wpcom/v2' },
				{
					name,
					key,
				}
			),
		{
			...options,
			onSuccess( ...args ) {
				queryClient.invalidateQueries( SSH_KEY_QUERY_KEY );
				options.onSuccess?.( ...args );
			},
		}
	);

	const { mutate } = mutation;

	const deleteSSHKey = useCallback( ( args: MutationVariables ) => mutate( args ), [ mutate ] );

	return deleteSSHKey;
};
