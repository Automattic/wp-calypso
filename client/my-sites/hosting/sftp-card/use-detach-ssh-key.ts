import { useMutation, UseMutationOptions, useQueryClient } from 'react-query';
import wp from 'calypso/lib/wp';
import { USE_ATOMIC_SSH_KEYS_QUERY_KEY } from './use-atomic-ssh-keys';

interface MutationVariables {
	name: string;
}

export const useDetachSshKeyMutation = (
	{ siteId, userId }: { siteId: number; userId: number | null },
	options: UseMutationOptions< void, void, MutationVariables > = {}
) => {
	const queryClient = useQueryClient();
	return useMutation(
		( { name }: { name: MutationVariables[ 'name' ] } ) => {
			const parts = name.split( '-' );
			const keyName = parts.pop();
			return wp.req.post( {
				path: `/sites/${ siteId }/hosting/ssh-keys/${ userId }/${ keyName }`,
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
