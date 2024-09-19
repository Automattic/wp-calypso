import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';
import { SSH_KEY_QUERY_KEY } from './use-ssh-key-query';

interface MutationVariables {
	sshKeyName: string;
}

interface MutationResponse {
	message: string;
}

interface MutationError {
	code: string;
	message: string;
}

export const useDeleteSSHKeyMutation = (
	options: UseMutationOptions< MutationResponse, MutationError, MutationVariables > = {}
) => {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: async ( { sshKeyName }: MutationVariables ) =>
			wp.req.get( {
				path: `/me/ssh-keys/${ sshKeyName }`,
				apiNamespace: 'wpcom/v2',
				method: 'DELETE',
			} ),
		...options,
		onSuccess: async ( ...args ) => {
			await queryClient.invalidateQueries( { queryKey: SSH_KEY_QUERY_KEY } );
			options.onSuccess?.( ...args );
		},
	} );

	const { mutate } = mutation;

	const deleteSSHKey = useCallback( ( args: MutationVariables ) => mutate( args ), [ mutate ] );

	return {
		deleteSSHKey,
		keyBeingDeleted:
			mutation.isPending && mutation.variables ? mutation.variables.sshKeyName : null,
	};
};
