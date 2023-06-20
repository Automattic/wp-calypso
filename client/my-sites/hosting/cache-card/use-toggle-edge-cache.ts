import {
	useMutation,
	UseMutationOptions,
	useQueryClient,
	useIsMutating,
} from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';
import { USE_EDGE_CACHE_QUERY_KEY } from './use-edge-cache';

interface MutationVariables {
	active: boolean;
}

interface MutationError {
	code: string;
	message: string;
}

export const TOGGLE_EDGE_CACHE_MUTATION_KEY = 'set-edge-site-mutation-key';

export const useToggleEdgeCacheMutation = (
	siteId: number,
	options: UseMutationOptions< boolean, MutationError, MutationVariables > = {}
) => {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: async ( active ) =>
			wp.req.post( {
				path: `/sites/${ siteId }/edge-cache/active`,
				apiNamespace: 'wpcom/v2',
				body: {
					active: active ? 1 : 0,
				},
			} ),
		...options,
		mutationKey: [ TOGGLE_EDGE_CACHE_MUTATION_KEY, siteId ],
		onSuccess: async ( ...args ) => {
			queryClient.setQueryData( [ USE_EDGE_CACHE_QUERY_KEY, siteId ], () => {
				return args[ 1 ];
			} );
			options?.onSuccess?.( ...args );
		},
	} );

	const { mutate } = mutation;
	// isMutating is returning a number. Greater than 0 means we have some pending mutations for
	// the provided key. This is preserved across different pages, while isLoading it's not.
	// TODO: Remove that when react-query v5 is out. They seem to have added isPending variable for this.
	const isLoading =
		useIsMutating( { mutationKey: [ TOGGLE_EDGE_CACHE_MUTATION_KEY, siteId ] } ) > 0;

	const toggleEdgeCache = useCallback( mutate, [ mutate ] );

	return { toggleEdgeCache, isLoading };
};
