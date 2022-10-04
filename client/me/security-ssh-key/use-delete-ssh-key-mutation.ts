import { useCallback } from 'react';
import { useMutation, UseMutationOptions, useQueryClient } from 'react-query';
import wp from 'calypso/lib/wp';
import { SSH_KEY_QUERY_KEY } from './use-ssh-key-query';

interface MutationVariables {
	sshKeyName: string;
}

export const useDeleteSSHKeyMutation = (
	options: UseMutationOptions< unknown, unknown, MutationVariables > = {}
) => {
	const queryClient = useQueryClient();
	const mutation = useMutation(
		async ( { sshKeyName }: MutationVariables ) => {
			const response = await wp.req.get( {
				path: `/me/ssh-keys/${ sshKeyName }`,
				apiNamespace: 'wpcom/v2',
				method: 'DELETE',
			} );

			if ( ! response.success ) {
				throw new Error( 'Deleting SSH key was unsuccessful', response );
			}

			return response;
		},
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
