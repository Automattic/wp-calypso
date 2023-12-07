import {
	useMutation,
	UseMutationOptions,
	useQueryClient,
	useIsMutating,
} from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';
import { USE_EDGE_CACHE_QUERY_KEY } from './use-edge-cache';

interface MutationError {
	code: string;
	message: string;
}

export const TOGGLE_EDGE_CACHE_MUTATION_KEY = 'set-edge-site-mutation-key';

export const useToggleEdgeCacheMutation = (
	siteId: number,
	options: UseMutationOptions< boolean, MutationError, boolean > = {}
) => {
	const queryClient = useQueryClient();
	const mutation = useMutation< boolean, MutationError, boolean >( {
		mutationFn: async ( active ) => {
			return wp.req.post( {
				path: `/sites/${ siteId }/hosting/edge-cache/active`,
				apiNamespace: 'wpcom/v2',
				body: {
					active,
				},
			} );
		},
		mutationKey: [ TOGGLE_EDGE_CACHE_MUTATION_KEY, siteId ],
		onMutate: async ( active ) => {
			await queryClient.cancelQueries( {
				queryKey: [ USE_EDGE_CACHE_QUERY_KEY, siteId ],
			} );
			const previousData = queryClient.getQueryData( [ USE_EDGE_CACHE_QUERY_KEY, siteId ] );
			queryClient.setQueryData( [ USE_EDGE_CACHE_QUERY_KEY, siteId ], active );
			return previousData;
		},
		onError( _err, _newActive, prevValue ) {
			// Revert to previous settings on failure
			queryClient.setQueryData( [ USE_EDGE_CACHE_QUERY_KEY, siteId ], Boolean( prevValue ) );
		},
		onSettled: ( ...args ) => {
			// Refetch settings regardless
			queryClient.invalidateQueries( {
				queryKey: [ USE_EDGE_CACHE_QUERY_KEY, siteId ],
			} );
			options?.onSettled?.( ...args );
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
