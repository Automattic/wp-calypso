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
		async ( { repoName, branchName }: MutationVariables ) =>
			wp.req.get( {
				path: `/sites/${ siteId }/hosting/github/connect?repo=${ repoName }&branch=${ branchName }`,
				apiNamespace: 'wpcom/v2',
			} ),
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
