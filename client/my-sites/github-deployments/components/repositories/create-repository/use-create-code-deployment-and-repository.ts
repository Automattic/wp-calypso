import { useMutation, UseMutationOptions, useQueryClient, useQuery } from '@tanstack/react-query';
import { addQueryArgs } from '@wordpress/url';
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

export const GITHUB_REPOSITORIES_QUERY_KEY = 'github-repositories';

export type RepositoryTemplate = {
	type: string;
	name: string;
	key: string;
	link: string;
};

export const useGithubRepositoriesTemplatesQuery = () => {
	const path = addQueryArgs( '/hosting/github/repositories/templates' );

	return useQuery< RepositoryTemplate[] >( {
		queryKey: [ GITHUB_DEPLOYMENTS_QUERY_KEY, GITHUB_REPOSITORIES_QUERY_KEY ],
		queryFn: (): RepositoryTemplate[] =>
			wp.req.get( {
				path,
				apiNamespace: 'wpcom/v2',
			} ),
		meta: {
			persist: false,
		},
	} );
};
