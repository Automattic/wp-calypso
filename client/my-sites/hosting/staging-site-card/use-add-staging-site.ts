import { useCallback } from 'react';
import { useMutation, UseMutationOptions, useQueryClient } from 'react-query';
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

export const useAddStagingSiteMutation = (
	siteId: number,
	options: UseMutationOptions< MutationResponse, MutationError, MutationVariables > = {}
) => {
	const queryClient = useQueryClient();
	const mutation = useMutation(
		async () =>
			wp.req.post( {
				path: `/sites/${ siteId }/staging-site`,
				apiNamespace: 'wpcom/v2',
			} ),
		{
			...options,
			onSuccess: async ( ...args ) => {
				await queryClient.invalidateQueries( [ USE_STAGING_SITE_QUERY_KEY, siteId ] );
				options.onSuccess?.( ...args );
			},
		}
	);

	const { mutate, isLoading } = mutation;

	const addStagingSite = useCallback( ( args ) => mutate( args ), [ mutate ] );

	return { addStagingSite, isLoading };
};
