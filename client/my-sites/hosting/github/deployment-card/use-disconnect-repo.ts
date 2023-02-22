import { useCallback } from 'react';
import { useMutation, UseMutationOptions, useQueryClient } from 'react-query';
import wp from 'calypso/lib/wp';
import { GITHUB_INTEGRATION_QUERY_KEY } from '../constants';
import { GITHUB_CONNECTION_QUERY_KEY } from '../use-github-connection-query';

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
				await queryClient.invalidateQueries( [
					GITHUB_INTEGRATION_QUERY_KEY,
					siteId,
					GITHUB_CONNECTION_QUERY_KEY,
				] );
				options.onSuccess?.( ...args );
			},
		}
	);

	const { mutate, isLoading } = mutation;

	const disconnectRepo = useCallback( ( args ) => mutate( args ), [ mutate ] );

	return { disconnectRepo, isLoading };
};
