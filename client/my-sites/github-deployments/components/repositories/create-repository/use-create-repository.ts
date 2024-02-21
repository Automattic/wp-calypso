import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';
import { GITHUB_DEPLOYMENTS_QUERY_KEY } from 'calypso/my-sites/github-deployments/constants';
import { CODE_DEPLOYMENTS_QUERY_KEY } from 'calypso/my-sites/github-deployments/deployments/use-code-deployments-query';

export interface MutationVariables {
	accountName: string;
	repositoryName: string;
	isPrivate: boolean;
	template: string;
}

export interface MutationResponse {
	external_id: number;
	account_name: string;
	repository_name: string;
	default_branch: string;
}

interface MutationError {
	code: string;
	message: string;
}

export const useCreateRepository = (
	siteId: number,
	options: UseMutationOptions< MutationResponse, MutationError, MutationVariables > = {}
) => {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: async ( { template, accountName, repositoryName, isPrivate }: MutationVariables ) =>
			wp.req.post(
				{
					path: `/hosting/github/repositories`,
					apiNamespace: 'wpcom/v2',
				},
				{
					template,
					account_name: accountName,
					repository_name: repositoryName,
					is_private: isPrivate,
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

	const createRepository = useCallback(
		( args: MutationVariables ) => mutateAsync( args ),
		[ mutateAsync ]
	);

	return { createRepository, isPending };
};
