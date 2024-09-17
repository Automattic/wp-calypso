import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { GITHUB_DEPLOYMENTS_QUERY_KEY } from '../constants';
import { CODE_DEPLOYMENTS_QUERY_KEY } from '../deployments/use-code-deployments-query';

interface MutationResponse {
	message: string;
}

interface MutationError {
	code: string;
	message: string;
}

export const useCreateCodeDeploymentRun = (
	siteId: number,
	deploymentId: number,
	options: UseMutationOptions< MutationResponse, MutationError > = {}
) => {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: async () =>
			wp.req.post( {
				path: `/sites/${ siteId }/hosting/code-deployments/${ deploymentId }/runs`,
				apiNamespace: 'wpcom/v2',
			} ),
		...options,
		onSuccess: async ( ...args ) => {
			await queryClient.invalidateQueries( {
				queryKey: [ GITHUB_DEPLOYMENTS_QUERY_KEY, CODE_DEPLOYMENTS_QUERY_KEY, siteId ],
			} );
			options.onSuccess?.( ...args );
		},
	} );

	const { mutate, isPending } = mutation;

	return { triggerManualDeployment: mutate, isPending };
};
