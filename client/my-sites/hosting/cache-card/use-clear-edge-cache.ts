import { useMutation, UseMutationOptions, useIsMutating } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';

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

export const CLEAR_EDGE_CACHE_MUTATION_KEY = 'clear-edge-site-mutation-key';

export const useClearEdgeCacheMutation = (
	siteId: number,
	options: UseMutationOptions< MutationResponse, MutationError, MutationVariables > = {}
) => {
	const mutation = useMutation( {
		mutationFn: async () =>
			wp.req.post( {
				path: `/sites/${ siteId }/hosting/edge-cache/purge`,
				apiNamespace: 'wpcom/v2',
			} ),
		...options,
		mutationKey: [ CLEAR_EDGE_CACHE_MUTATION_KEY, siteId ],
		onSuccess: async ( ...args ) => {
			options?.onSuccess?.( ...args );
		},
	} );

	const { mutate } = mutation;
	// isMutating is returning a number. Greater than 0 means we have some pending mutations for
	// the provided key. This is preserved across different pages, while isLoading it's not.
	// TODO: Remove that when react-query v5 is out. They seem to have added isPending variable for this.
	const isLoading = useIsMutating( { mutationKey: [ CLEAR_EDGE_CACHE_MUTATION_KEY, siteId ] } ) > 0;

	const clearEdgeCache = useCallback( mutate, [ mutate ] );

	return { clearEdgeCache, isLoading };
};
