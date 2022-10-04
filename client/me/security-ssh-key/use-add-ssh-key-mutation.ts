import { useCallback } from 'react';
import { useMutation, UseMutationOptions, useQueryClient } from 'react-query';
import wp from 'calypso/lib/wp';
import { SSH_KEY_QUERY_KEY } from './use-ssh-key-query';

interface MutationVariables {
	name: string;
	key: string;
}

export const useAddSSHKeyMutation = (
	options: UseMutationOptions< unknown, unknown, MutationVariables > = {}
) => {
	const queryClient = useQueryClient();
	const mutation = useMutation(
		async ( { name, key }: MutationVariables ) => {
			const response = await wp.req.post(
				{ path: '/me/ssh-keys', apiNamespace: 'wpcom/v2' },
				{
					name,
					key,
				}
			);

			if ( ! response.success ) {
				throw new Error( 'Adding SSH key was unsuccessful', response );
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
