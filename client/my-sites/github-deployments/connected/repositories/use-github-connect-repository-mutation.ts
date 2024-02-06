import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';
import { GITHUB_DEPLOYMENTS_QUERY_KEY } from 'calypso/my-sites/github-deployments/constants';
import { GITHUB_CONNECTION_QUERY_KEY } from 'calypso/my-sites/github-deployments/use-github-connection-query';

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

export const useGithubConnectRepositoryMutation = (
	siteId: number | null,
	options: UseMutationOptions< MutationResponse, MutationError, MutationVariables > = {}
) => {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		//todo sent basePath
		mutationFn: async ( { repoName, branchName, basePath }: MutationVariables ) =>
			wp.req.post(
				{
					path: `/sites/${ siteId }/hosting/github-app/connection`,
					apiNamespace: 'wpcom/v2',
				},
				{ repo: repoName, branch: branchName, base_path: basePath }
			),
		...options,
		onSuccess: async ( ...args ) => {
			await queryClient.invalidateQueries( {
				queryKey: [ GITHUB_DEPLOYMENTS_QUERY_KEY, siteId, GITHUB_CONNECTION_QUERY_KEY ],
			} );
			options.onSuccess?.( ...args );
		},
	} );

	const { mutate, isPending } = mutation;

	const connectBranch = useCallback( ( args: MutationVariables ) => mutate( args ), [ mutate ] );

	return { connectBranch, isPending };
};
