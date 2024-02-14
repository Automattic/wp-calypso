import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';
import { GITHUB_DEPLOYMENTS_QUERY_KEY } from 'calypso/my-sites/github-deployments/constants';
import { CODE_DEPLOYMENTS_QUERY_KEY } from 'calypso/my-sites/github-deployments/deployments/use-code-deployments-query';

interface MutationVariables {
	externalRepositoryId: number;
	branchName: string;
	targetDir: string;
	installationId: number;
	isAutomated?: boolean;
}

interface MutationResponse {
	message: string;
}

interface MutationError {
	code: string;
	message: string;
}

export const useUpdateCodeDeployment = (
	siteId: number | null,
	codeDeploymentId: number,
	options: UseMutationOptions< MutationResponse, MutationError, MutationVariables > = {}
) => {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: async ( {
			externalRepositoryId,
			targetDir,
			branchName,
			installationId,
			isAutomated,
		}: MutationVariables ) =>
			wp.req.put(
				{
					path: `/sites/${ siteId }/hosting/code-deployments/${ codeDeploymentId }`,
					apiNamespace: 'wpcom/v2',
				},
				{
					external_repository_id: externalRepositoryId,
					branch_name: branchName,
					target_dir: targetDir,
					installation_id: installationId,
					is_automated: isAutomated,
				}
			),
		...options,
		onSuccess: async ( ...args ) => {
			await queryClient.invalidateQueries( {
				queryKey: [ GITHUB_DEPLOYMENTS_QUERY_KEY, CODE_DEPLOYMENTS_QUERY_KEY, siteId ],
				exact: false,
			} );
			return options.onSuccess?.( ...args );
		},
	} );

	const { mutateAsync, isPending } = mutation;

	const updateDeployment = useCallback(
		( args: MutationVariables ) => mutateAsync( args ),
		[ mutateAsync ]
	);

	return { updateDeployment, isPending };
};
