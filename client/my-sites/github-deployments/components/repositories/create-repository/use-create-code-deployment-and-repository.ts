import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';
import { GITHUB_DEPLOYMENTS_QUERY_KEY } from 'calypso/my-sites/github-deployments/constants';
import { CODE_DEPLOYMENTS_QUERY_KEY } from 'calypso/my-sites/github-deployments/deployments/use-code-deployments-query';

export interface MutationVariables {
	installationId: number;
	template: string;
	accountName: string;
	repositoryName: string;
	isPrivate?: boolean;
	isAutomated?: boolean;
}

interface MutationResponse {
	message: string;
}

interface MutationError {
	code: string;
	message: string;
}

export const useCreateCodeDeploymentAndRepository = (
	siteId: number,
	options: UseMutationOptions< MutationResponse, MutationError, MutationVariables > = {}
) => {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: async ( {
			template,
			installationId,
			accountName,
			repositoryName,
			isPrivate,
			isAutomated,
		}: MutationVariables ) =>
			wp.req.post(
				{
					path: `/hosting/github/repositories`,
					apiNamespace: 'wpcom/v2',
				},
				{
					template,
					installation_id: installationId,
					account_name: accountName,
					repository_name: repositoryName,
					is_private: isPrivate,
					is_automated: isAutomated,
					blog_id: siteId,
				}
			),
		...options,
		onSuccess: async ( ...args ) => {
			await queryClient.invalidateQueries( {
				queryKey: [ GITHUB_DEPLOYMENTS_QUERY_KEY, CODE_DEPLOYMENTS_QUERY_KEY, siteId ],
			} );
			options.onSuccess?.( ...args );
		},
	} );

	const { mutateAsync, isPending } = mutation;

	const createDeploymentAndRepository = useCallback(
		( args: MutationVariables ) => mutateAsync( args ),
		[ mutateAsync ]
	);

	return { createDeploymentAndRepository, isPending };
};
