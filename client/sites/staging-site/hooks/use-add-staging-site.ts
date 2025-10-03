import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import wp from 'calypso/lib/wp';
import { requestSite } from 'calypso/state/sites/actions';
import { USE_STAGING_SITE_QUERY_KEY } from './use-staging-site';

interface MutationVariables {
	name: string;
}

interface MutationResponse {
	id: number;
	name: string;
	url: string;
	user_has_permission: boolean;
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
	const dispatch = useDispatch();

	const mutation = useMutation( {
		mutationFn: () =>
			wp.req.post( {
				path: `/sites/${ siteId }/staging-site`,
				apiNamespace: 'wpcom/v2',
			} ),
		...options,
		mutationKey: [ ADD_STAGING_SITE_MUTATION_KEY, siteId ],
		onSuccess: async ( response, variables, context ) => {
			await queryClient.invalidateQueries( {
				queryKey: [ USE_STAGING_SITE_QUERY_KEY, siteId ],
			} );

			if ( response.id ) {
				dispatch( requestSite( response.id ) );
			}

			options.onSuccess?.( response, variables, context );
		},
	} );

	const { mutate, isPending } = mutation;

	return { addStagingSite: mutate, isLoading: isPending };
};
