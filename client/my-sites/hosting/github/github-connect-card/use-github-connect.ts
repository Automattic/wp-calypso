import { useCallback } from 'react';
import { useMutation, UseMutationOptions, useQueryClient } from 'react-query';
import wp from 'calypso/lib/wp';

const USE_GITHUB_CONNECT_QUERY_KEY = 'github-connect-query-key';

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

export const useGithubConnectMutation = (
	siteId: number | null,
	options: UseMutationOptions< MutationResponse, MutationError, MutationVariables > = {}
) => {
	const queryClient = useQueryClient();
	const mutation = useMutation(
		//todo sent basePath
		async ( { repoName, branchName, basePath }: MutationVariables ) =>
			wp.req.post(
				{
					path: `/sites/${ siteId }/hosting/github/connect`,
					apiNamespace: 'wpcom/v2',
				},
				{ repo: repoName, branch: branchName, base_path: basePath }
			),
		{
			...options,
			onSuccess: async ( ...args ) => {
				await queryClient.invalidateQueries( [ USE_GITHUB_CONNECT_QUERY_KEY, siteId ] );
				options.onSuccess?.( ...args );
			},
		}
	);

	const { mutate, isLoading } = mutation;

	const connectBranch = useCallback( ( args: MutationVariables ) => mutate( args ), [ mutate ] );

	return { connectBranch, isLoading };
};
