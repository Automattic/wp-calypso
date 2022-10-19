import { useMutation, UseMutationOptions, useQueryClient } from 'react-query';
import wp from 'calypso/lib/wp';
import { USE_ATOMIC_SSH_KEYS_QUERY_KEY } from './use-atomic-ssh-keys';

interface MutationVariables {
	user_login: string;
	name: string;
}

export const useDetachSshKeyMutation = (
	{ siteId }: { siteId: number },
	options: UseMutationOptions< void, void, MutationVariables > = {}
) => {
	const queryClient = useQueryClient();
	return useMutation(
		( { user_login, name }: MutationVariables ) => {
			return wp.req.post( {
				path: `/sites/${ siteId }/hosting/ssh-keys/${ user_login }/${ name }`,
				apiNamespace: 'wpcom/v2',
				method: 'DELETE',
			} );
		},
		{
			...options,
			onSuccess: async ( ...args ) => {
				await queryClient.invalidateQueries( [ USE_ATOMIC_SSH_KEYS_QUERY_KEY, siteId ] );
				options.onSuccess?.( ...args );
			},
		}
	);
};
