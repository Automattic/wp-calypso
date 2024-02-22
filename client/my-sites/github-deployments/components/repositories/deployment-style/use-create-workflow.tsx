import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';
import { GITHUB_DEPLOYMENTS_QUERY_KEY } from 'calypso/my-sites/github-deployments/constants';
import { CODE_DEPLOYMENTS_QUERY_KEY } from 'calypso/my-sites/github-deployments/deployments/use-code-deployments-query';

interface MutationVariables {
	repositoryId: number;
	branchName: string;
	installationId: number;
	fileName: string;
	fileContent: string;
}

interface MutationResponse {
	message: string;
}

interface MutationError {
	code: string;
	message: string;
}

export const useCreateWorkflow = (
	options: UseMutationOptions< MutationResponse, MutationError, MutationVariables > = {}
) => {
	const queryClient = useQueryClient();
	const path = `/hosting/github/workflows`;
	const mutation = useMutation( {
		mutationFn: async ( {
			repositoryId,
			branchName,
			installationId,
			fileName,
			fileContent,
		}: MutationVariables ) =>
			wp.req.post(
				{
					path,
					apiNamespace: 'wpcom/v2',
				},
				{
					repository_id: repositoryId,
					branch_name: branchName,
					installation_id: installationId,
					file_name: fileName,
					file_content: fileContent,
				}
			),
		...options,
		onSuccess: async ( ...args ) => {
			await queryClient.invalidateQueries( {
				queryKey: [ GITHUB_DEPLOYMENTS_QUERY_KEY, CODE_DEPLOYMENTS_QUERY_KEY, path ],
			} );
			options.onSuccess?.( ...args );
		},
	} );

	const { mutateAsync, isPending } = mutation;

	const createDeployment = useCallback(
		( args: MutationVariables ) => mutateAsync( args ),
		[ mutateAsync ]
	);

	return { createDeployment, isPending };
};
