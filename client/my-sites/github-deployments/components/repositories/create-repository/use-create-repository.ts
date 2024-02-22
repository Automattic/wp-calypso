import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';
import { GITHUB_DEPLOYMENTS_QUERY_KEY } from 'calypso/my-sites/github-deployments/constants';

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

const GITHUB_REPOSITORIES_MUATION_KEY = 'github-repositories-mutation';

export const useCreateRepository = (
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
				}
			),
		...options,
		onSuccess: async ( ...args ) => {
			await queryClient.invalidateQueries( {
				queryKey: [ GITHUB_DEPLOYMENTS_QUERY_KEY, GITHUB_REPOSITORIES_MUATION_KEY ],
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
