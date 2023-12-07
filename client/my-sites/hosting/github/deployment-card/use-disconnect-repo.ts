import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';
import { GITHUB_INTEGRATION_QUERY_KEY } from '../constants';
import { GITHUB_CONNECTION_QUERY_KEY } from '../use-github-connection-query';

interface MutationError {
	code: string;
	message: string;
}

export const useGithubDisconnectRepoMutation = (
	siteId: number | null,
	connectionId: number,
	options: UseMutationOptions< unknown, MutationError, unknown > = {}
) => {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: async () =>
			wp.req.post( {
				method: 'DELETE',
				path: `/sites/${ siteId }/hosting/github/connection`,
				apiNamespace: 'wpcom/v2',
			} ),
		...options,
		onSuccess: async ( ...args ) => {
			await Promise.all( [
				queryClient.invalidateQueries( {
					queryKey: [ GITHUB_INTEGRATION_QUERY_KEY, siteId, connectionId ],
				} ),
				queryClient.invalidateQueries( {
					queryKey: [ GITHUB_INTEGRATION_QUERY_KEY, siteId, GITHUB_CONNECTION_QUERY_KEY ],
				} ),
			] );
			options.onSuccess?.( ...args );
		},
	} );

	const { mutate, isLoading } = mutation;

	const disconnectRepo = useCallback( ( siteId: number | null ) => mutate( siteId ), [ mutate ] );

	return { disconnectRepo, isLoading };
};
