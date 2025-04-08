import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';
import { GITHUB_DEPLOYMENTS_QUERY_KEY } from '../constants';
import { CODE_DEPLOYMENTS_QUERY_KEY } from './use-code-deployments-query';

interface MutationResponse {
	message: string;
}

interface MutationError {
	code: string;
	message: string;
}

interface MutationVariables {
	removeFiles: boolean;
}

export const useDeleteCodeDeployment = ( siteId: number, deploymentId: number ) => {
	const queryClient = useQueryClient();
	const mutation = useMutation< MutationResponse, MutationError, MutationVariables >( {
		mutationFn: async ( { removeFiles } ) =>
			wp.req.post(
				{
					method: 'DELETE',
					path: `/sites/${ siteId }/hosting/code-deployments/${ deploymentId }`,
					apiNamespace: 'wpcom/v2',
				},
				{
					remove_files: removeFiles,
				}
			),
		onSuccess: async () => {
			await queryClient.invalidateQueries( {
				queryKey: [ GITHUB_DEPLOYMENTS_QUERY_KEY, CODE_DEPLOYMENTS_QUERY_KEY, siteId ],
			} );
		},
	} );

	const { mutateAsync, isPending } = mutation;

	const deleteDeployment = useCallback(
		( args: MutationVariables ) => mutateAsync( args ),
		[ mutateAsync ]
	);

	return { deleteDeployment, isPending };
};
