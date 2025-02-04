import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { USE_STAGING_SITE_QUERY_KEY } from './use-staging-site';

interface MutationVariables {
	name: string;
}

interface MutationResponse {
	message: string;
}

interface MutationError {
	code: string;
	message: string;
}

export const ADD_STAGING_SITE_MUTATION_KEY = 'add-staging-site-mutation-key';

export const useAddStagingSiteMutation = (
	siteId: number,
	options: UseMutationOptions< MutationResponse, MutationError, MutationVariables > = {}
) => {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: () =>
			wp.req.post( {
				path: `/sites/${ siteId }/staging-site`,
				apiNamespace: 'wpcom/v2',
			} ),
		...options,
		mutationKey: [ ADD_STAGING_SITE_MUTATION_KEY, siteId ],
		onSuccess: async ( ...args ) => {
			await queryClient.invalidateQueries( {
				queryKey: [ USE_STAGING_SITE_QUERY_KEY, siteId ],
			} );
			options.onSuccess?.( ...args );
		},
	} );

	const { mutate, isPending } = mutation;

	return { addStagingSite: mutate, isLoading: isPending };
};
