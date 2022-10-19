import { useMutation, UseMutationOptions, useQueryClient } from 'react-query';
import wp from 'calypso/lib/wp';
import { USE_ATOMIC_SSH_KEYS_QUERY_KEY } from './use-atomic-ssh-keys';

interface MutationVariables {
	name: string;
}

export const useAttachSshKeyMutation = (
	siteId: number,
	options: UseMutationOptions< void, void, MutationVariables > = {}
) => {
	const queryClient = useQueryClient();
	return useMutation(
		( { name }: MutationVariables ) =>
			wp.req.post( {
				path: `/sites/${ siteId }/hosting/ssh-keys`,
				apiNamespace: 'wpcom/v2',
				body: { name },
			} ),
		{
			...options,
			onSuccess: async ( ...args ) => {
				await queryClient.invalidateQueries( [ USE_ATOMIC_SSH_KEYS_QUERY_KEY, siteId ] );
				options.onSuccess?.( ...args );
			},
		}
	);
};
