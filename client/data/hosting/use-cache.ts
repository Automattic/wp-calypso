import {
	useQuery,
	useMutation,
	UseMutationOptions,
	useQueryClient,
	useIsMutating,
	DefaultError,
} from '@tanstack/react-query';
import { useI18n } from '@wordpress/react-i18n';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';
import { useDispatch } from 'calypso/state';
import { successNotice, errorNotice, plainNotice } from 'calypso/state/notices/actions';

export const EDGE_CACHE_ENABLE_DISABLE_NOTICE_ID = 'edge-cache-enable-disable-notice';
export const USE_EDGE_CACHE_QUERY_KEY = 'edge-cache-key';
export const TOGGLE_EDGE_CACHE_MUTATION_KEY = 'set-edge-site-mutation-key';
export const CLEAR_EDGE_CACHE_MUTATION_KEY = 'clear-edge-site-mutation-key';
export const EDGE_CACHE_DEFENSIVE_MODE_QUERY_KEY = 'edge-cache-defensive-mode-key';

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
	return await wp.req.get( {
		path: `/sites/${ siteId }/hosting/edge-cache/active`,
		apiNamespace: 'wpcom/v2',
	} );
};

export const purgeEdgeCache = async ( siteId: number ) => {
	return await wp.req.post( {
		path: `/sites/${ siteId }/hosting/edge-cache/purge`,
		apiNamespace: 'wpcom/v2',
	} );
};

export const useEdgeCacheQuery = ( siteId: number | null ) => {
	return useQuery< boolean >( {
		queryKey: [ USE_EDGE_CACHE_QUERY_KEY, siteId ],
		queryFn: () => getEdgeCacheStatus( siteId as number ),
		enabled: !! siteId,
		meta: {
			persist: false,
		},
	} );
};

export const useSetEdgeCacheMutation = (
	options: UseMutationOptions< boolean, MutationError, SetEdgeCacheMutationVariables > = {}
) => {
	const { __ } = useI18n();
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	const mutation = useMutation< boolean, MutationError, SetEdgeCacheMutationVariables >( {
		...options,
		mutationFn: async ( { active, siteId } ) => {
			return await wp.req.post( {
				path: `/sites/${ siteId }/hosting/edge-cache/active`,
				apiNamespace: 'wpcom/v2',
				body: {
					active,
				},
			} );
		},
		mutationKey: [ TOGGLE_EDGE_CACHE_MUTATION_KEY ],
		onMutate: async ( { active, siteId } ) => {
			await queryClient.cancelQueries( {
				queryKey: [ USE_EDGE_CACHE_QUERY_KEY, siteId ],
			} );
			const previousData = queryClient.getQueryData( [ USE_EDGE_CACHE_QUERY_KEY, siteId ] );
			queryClient.setQueryData( [ USE_EDGE_CACHE_QUERY_KEY, siteId ], active );
			return previousData;
		},
		onSuccess( data, variables, context ) {
			const defensiveModeKey = getEdgeCacheDefensiveModeQueryKey( variables.siteId );
			queryClient.invalidateQueries( { queryKey: defensiveModeKey } );

			dispatch(
				successNotice(
					variables.active ? __( 'Edge cache enabled.' ) : __( 'Edge cache disabled.' ),
					{
						duration: 5000,
						id: EDGE_CACHE_ENABLE_DISABLE_NOTICE_ID,
					}
				)
			);
			options?.onSuccess?.( data, variables, context );
		},
		onError( error, variables, prevValue ) {
			// Revert to previous settings on failure
			queryClient.setQueryData(
				[ USE_EDGE_CACHE_QUERY_KEY, variables.siteId ],
				Boolean( prevValue )
			);

			dispatch(
				errorNotice(
					variables.active
						? __( 'Failed to enable edge cache.' )
						: __( 'Failed to disable edge cache.' ),
					{ duration: 5000, id: EDGE_CACHE_ENABLE_DISABLE_NOTICE_ID }
				)
			);

			options?.onError?.( error, variables, prevValue );
		},
		onSettled( data, error, variables, context ) {
			// Refetch settings regardless
			queryClient.invalidateQueries( {
				queryKey: [ USE_EDGE_CACHE_QUERY_KEY, variables.siteId ],
			} );
			options?.onSettled?.( data, error, variables, context );
		},
	} );

	const { mutate, ...rest } = mutation;

	const setEdgeCache = useCallback(
		( siteId: number, active: boolean ) => {
			dispatch(
				plainNotice( active ? __( 'Enabling edge cache…' ) : __( 'Disabling edge cache…' ), {
					duration: 5000,
					id: EDGE_CACHE_ENABLE_DISABLE_NOTICE_ID,
				} )
			);

			mutate( { siteId, active } );
		},
		[ dispatch, mutate, __ ]
	);

	return { setEdgeCache, ...rest };
};

export const useIsSetEdgeCacheMutating = ( siteId: number ) => {
	const count = useIsMutating( {
		predicate: ( mutation ) =>
			mutation.options.mutationKey?.[ 0 ] === TOGGLE_EDGE_CACHE_MUTATION_KEY &&
			mutation.state.variables?.siteId === siteId,
	} );

	return count > 0;
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
	} );

	const { mutate } = mutation;
	// isMutating is returning a number. Greater than 0 means we have some pending mutations for
	// the provided key. This is preserved across different pages, while isLoading it's not.
	// TODO: Remove that when react-query v5 is out. They seem to have added isPending variable for this.
	const isLoading = useIsMutating( { mutationKey: [ CLEAR_EDGE_CACHE_MUTATION_KEY, siteId ] } ) > 0;

	const clearEdgeCache = useCallback( mutate, [ mutate ] );

	return { clearEdgeCache, isLoading };
};

function getEdgeCacheDefensiveModeQueryKey( siteId: number | null ) {
	return [ EDGE_CACHE_DEFENSIVE_MODE_QUERY_KEY, siteId ];
}

type EdgeCacheDefensiveModeQueryData = {
	enabled: boolean;
	enabled_until: number;
};

export function useEdgeCacheDefensiveModeQuery( siteId: number | null ) {
	return useQuery< EdgeCacheDefensiveModeQueryData >( {
		queryKey: getEdgeCacheDefensiveModeQueryKey( siteId ),
		queryFn: () =>
			wp.req.get( {
				path: `/sites/${ siteId }/hosting/edge-cache/defensive-mode`,
				apiNamespace: 'wpcom/v2',
			} ),
		enabled: siteId !== null,
	} );
}

type EdgeCacheDefensiveModeMutationVariables = { active: true; ttl: number } | { active: false };

export function useEdgeCacheDefensiveModeMutation( siteId: number | null ) {
	const queryClient = useQueryClient();
	const queryKey = getEdgeCacheDefensiveModeQueryKey( siteId );
	const dispatch = useDispatch();
	const translate = useTranslate();

	return useMutation<
		EdgeCacheDefensiveModeQueryData,
		DefaultError,
		EdgeCacheDefensiveModeMutationVariables
	>( {
		mutationFn( variables ) {
			return wp.req.post( {
				path: `/sites/${ siteId }/hosting/edge-cache/defensive-mode`,
				apiNamespace: 'wpcom/v2',
				body: variables,
			} );
		},
		onSuccess( data ) {
			queryClient.setQueryData( queryKey, data );

			const toastMessage = data.enabled
				? translate( 'Successfully enabled defensive mode.' )
				: translate( 'Successfully disabled defensive mode.' );
			dispatch( successNotice( toastMessage, { duration: 5000 } ) );
		},
		onError( error, variables ) {
			const toastMessage = variables.active
				? translate( 'Failed to enable defensive mode.' )
				: translate( 'Failed to disable defensive mode.' );
			dispatch( errorNotice( toastMessage, { duration: 5000 } ) );
		},
	} );
}
