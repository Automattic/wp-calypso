import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';
import { GITHUB_INTEGRATION_QUERY_KEY } from './constants';

interface MutationVariables {
	repoName: string | undefined;
	branchName: string | undefined;
	basePath?: string;
}

interface MutationResponse {
	message: string;
}

interface MutationError {
	code: string;
	message: string;
}

export const useGithubCreateDeploymentMutation = (
	siteId: number | null,
	options: UseMutationOptions< MutationResponse, MutationError, MutationVariables > = {}
) => {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		//todo sent basePath
		mutationFn: async ( { repoName, branchName, basePath }: MutationVariables ) =>
			wp.req.post(
				{
					path: `/sites/${ siteId }/hosting/github-app/deployment`,
					apiNamespace: 'wpcom/v2',
				},
				{ repo: repoName, branch: branchName, base_path: basePath }
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

	const createDeployment = useCallback( ( args: MutationVariables ) => mutate( args ), [ mutate ] );

	return { createDeployment, isPending };
};
