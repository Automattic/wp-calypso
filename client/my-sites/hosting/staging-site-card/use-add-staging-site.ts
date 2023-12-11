import {
	useMutation,
	UseMutationOptions,
	useQueryClient,
	useIsMutating,
} from '@tanstack/react-query';
import { useCallback } from 'react';
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
		mutationFn: async () =>
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

	const { mutate } = mutation;
	// isMutating is returning a number. Greater than 0 means we have some pending mutations for
	// the provided key. This is preserved across different pages, while isLoading it's not.
	// TODO: Remove that when react-query v5 is out. They seem to have added isPending variable for this.
	const isLoading = useIsMutating( { mutationKey: [ ADD_STAGING_SITE_MUTATION_KEY, siteId ] } ) > 0;

	const addStagingSite = useCallback( ( args: MutationVariables ) => mutate( args ), [ mutate ] );

	return { addStagingSite, isLoading };
};
