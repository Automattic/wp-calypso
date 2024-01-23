import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';
import { GITHUB_INTEGRATION_QUERY_KEY } from './constants';

interface MutationVariables {
	repoName: string | undefined;
}

interface MutationResponse {
	message: string;
}

interface MutationError {
	code: string;
	message: string;
}

export const useGithubDeleteDeploymentMutation = (
	siteId: number | null,
	options: UseMutationOptions< MutationResponse, MutationError, MutationVariables > = {}
) => {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: async ( { repoName }: MutationVariables ) =>
			wp.req.get(
				{
					path: `/sites/${ siteId }/hosting/github-app/deployment`,
					apiNamespace: 'wpcom/v2',
					method: 'DELETE',
				},
				{ repo: repoName }
			),
		...options,
		onSuccess: async ( ...args ) => {
			await queryClient.invalidateQueries( {
				queryKey: [ GITHUB_INTEGRATION_QUERY_KEY, siteId, 'repos' ],
			} );
			options.onSuccess?.( ...args );
		},
	} );

	const { mutate, isPending } = mutation;

	const deleteDeployment = useCallback( ( args: MutationVariables ) => mutate( args ), [ mutate ] );

	return { deleteDeployment, isPending };
};
