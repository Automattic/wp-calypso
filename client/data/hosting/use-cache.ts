import {
	useQuery,
	useMutation,
	UseMutationOptions,
	useQueryClient,
	useIsMutating,
} from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';

export const EDGE_CACHE_ENABLE_DISABLE_NOTICE_ID = 'edge-cache-enable-disable-notice';
export const USE_EDGE_CACHE_QUERY_KEY = 'edge-cache-key';
export const TOGGLE_EDGE_CACHE_MUTATION_KEY = 'set-edge-site-mutation-key';
export const CLEAR_EDGE_CACHE_MUTATION_KEY = 'clear-edge-site-mutation-key';

interface ClearEdgeCacheMutationVariables {
	name: string;
}

interface SetEdgeCacheMutationVariables {
	siteId: number;
	active: boolean;
}

interface MutationResponse {
	message: string;
}

interface MutationError {
	code: string;
	message: string;
}

export const getEdgeCacheStatus = async ( siteId: number ) => {
	const response = await wp.req.get( {
		path: `/sites/${ siteId }/hosting/edge-cache/active`,
		apiNamespace: 'wpcom/v2',
	} );

	return response;
};

export const purgeEdgeCache = async ( siteId: number ) => {
	return await wp.req.post( {
		path: `/sites/${ siteId }/hosting/edge-cache/purge`,
		apiNamespace: 'wpcom/v2',
	} );
};

export const useEdgeCacheQuery = ( siteId: number ) => {
	return useQuery< boolean, unknown, boolean >( {
		queryKey: [ USE_EDGE_CACHE_QUERY_KEY, siteId ],
		queryFn: () => getEdgeCacheStatus( siteId ),
		enabled: !! siteId,
		select: ( data ) => {
			return !! data;
		},
		meta: {
			persist: false,
		},
	} );
};

interface MutationError {
	code: string;
	message: string;
}

export const useSetEdgeCacheMutation = (
	options: UseMutationOptions< boolean, MutationError, SetEdgeCacheMutationVariables > = {}
) => {
	const queryClient = useQueryClient();
	const mutation = useMutation< boolean, MutationError, SetEdgeCacheMutationVariables >( {
		mutationFn: async ( { active, siteId } ) => {
			return await wp.req.post( {
				path: `/sites/${ siteId }/hosting/edge-cache/active`,
				apiNamespace: 'wpcom/v2',
				body: {
					active,
				},
			} );
		},
		onMutate: async ( { active, siteId } ) => {
			await queryClient.cancelQueries( {
				queryKey: [ USE_EDGE_CACHE_QUERY_KEY, siteId ],
			} );
			const previousData = queryClient.getQueryData( [ USE_EDGE_CACHE_QUERY_KEY, siteId ] );
			queryClient.setQueryData( [ USE_EDGE_CACHE_QUERY_KEY, siteId ], active );
			return previousData;
		},
		onError( _err, { siteId }, prevValue ) {
			// Revert to previous settings on failure
			queryClient.setQueryData( [ USE_EDGE_CACHE_QUERY_KEY, siteId ], Boolean( prevValue ) );
		},
		onSettled: ( ...args ) => {
			const { siteId } = args[ 2 ];
			// Refetch settings regardless
			queryClient.invalidateQueries( {
				queryKey: [ USE_EDGE_CACHE_QUERY_KEY, siteId ],
			} );
			options?.onSettled?.( ...args );
		},
	} );

	const { mutate, ...rest } = mutation;

	const setEdgeCache = useCallback(
		( siteId: number, active: boolean ) => mutate( { siteId, active } ),
		[ mutate ]
	);

	return { setEdgeCache, ...rest };
};

export const useClearEdgeCacheMutation = (
	siteId: number,
	options: UseMutationOptions<
		MutationResponse,
		MutationError,
		ClearEdgeCacheMutationVariables
	> = {}
) => {
	const mutation = useMutation( {
		mutationFn: async () => purgeEdgeCache( siteId ),
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
