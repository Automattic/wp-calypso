import { useCallback } from 'react';
import { useMutation, UseMutationOptions, useQueryClient } from 'react-query';
import wp from 'calypso/lib/wp';

const USE_GITHUB_DISCONNECT_REPO_QUERY_KEY = 'github-disconnect-repo-query-key';

interface MutationError {
	code: string;
	message: string;
}

export const useGithubDisconnectRepoMutation = (
	siteId: number | null,
	options: UseMutationOptions< unknown, MutationError, unknown > = {}
) => {
	const queryClient = useQueryClient();
	const mutation = useMutation(
		async () =>
			wp.req.post( {
				method: 'DELETE',
				path: `/sites/${ siteId }/hosting/github/connection`,
				apiNamespace: 'wpcom/v2',
			} ),
		{
			...options,
			onSuccess: async ( ...args ) => {
				await queryClient.invalidateQueries( [ USE_GITHUB_DISCONNECT_REPO_QUERY_KEY, siteId ] );
				options.onSuccess?.( ...args );
			},
		}
	);

	const { mutate, isLoading } = mutation;

	const disconnectRepo = useCallback( ( args ) => mutate( args ), [ mutate ] );

	return { disconnectRepo, isLoading };
};
