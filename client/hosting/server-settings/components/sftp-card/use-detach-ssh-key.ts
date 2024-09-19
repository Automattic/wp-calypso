import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';
import { USE_ATOMIC_SSH_KEYS_QUERY_KEY } from './use-atomic-ssh-keys';

interface MutationVariables {
	user_login: string;
	name: string;
}

interface MutationResponse {
	message: string;
}

interface MutationError {
	code: string;
	message: string;
}

export const useDetachSshKeyMutation = (
	{ siteId }: { siteId: number },
	options: UseMutationOptions< MutationResponse, MutationError, MutationVariables > = {}
) => {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: async ( { user_login, name }: MutationVariables ) => {
			return wp.req.post( {
				path: `/sites/${ siteId }/hosting/ssh-keys/${ user_login }/${ name }`,
				apiNamespace: 'wpcom/v2',
				method: 'DELETE',
			} );
		},
		...options,
		onSuccess: async ( ...args ) => {
			await queryClient.invalidateQueries( {
				queryKey: [ USE_ATOMIC_SSH_KEYS_QUERY_KEY, siteId ],
			} );
			options.onSuccess?.( ...args );
		},
	} );
	const { mutate, isPending } = mutation;

	const detachSshKey = useCallback( ( args: MutationVariables ) => mutate( args ), [ mutate ] );

	return { detachSshKey, isPending };
};
