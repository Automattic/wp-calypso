import { useQuery, useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { useI18n } from '@wordpress/react-i18n';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';
import { useDispatch } from 'calypso/state';
import { createNotice, successNotice, errorNotice } from 'calypso/state/notices/actions';

export const EDGE_CACHE_ENABLE_DISABLE_NOTICE_ID = 'edge-cache-enable-disable-notice';
export const USE_EDGE_CACHE_QUERY_KEY = 'edge-cache-key';
export const TOGGLE_EDGE_CACHE_MUTATION_KEY = 'set-edge-site-mutation-key';
export const CLEAR_EDGE_CACHE_MUTATION_KEY = 'clear-edge-site-mutation-key';

interface SetEdgeCacheMutationVariables {
	siteId: number | null;
	active: boolean;
}

interface MutationResponse {
	message: string;
}

interface MutationError {
	code: string;
	message: string;
}

export const getEdgeCacheStatus = async ( siteId: number | null ) => {
	return await wp.req.get( {
		path: `/sites/${ siteId }/hosting/edge-cache/active`,
		apiNamespace: 'wpcom/v2',
	} );
};

export const purgeEdgeCache = async ( siteId: number | null ) => {
	return await wp.req.post( {
		path: `/sites/${ siteId }/hosting/edge-cache/purge`,
		apiNamespace: 'wpcom/v2',
	} );
};

export const useEdgeCacheQuery = ( siteId: number | null ) => {
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
		onSuccess( ...args ) {
			const [ , { active } ] = args;
			dispatch(
				createNotice(
					'is-success',
					active ? __( 'Edge cache enabled.' ) : __( 'Edge cache disabled.' ),
					{
						duration: 5000,
						id: EDGE_CACHE_ENABLE_DISABLE_NOTICE_ID,
					}
				)
			);
			options?.onSuccess?.( ...args );
		},
		onError( ...args ) {
			const [ , { active, siteId }, prevValue ] = args;
			// Revert to previous settings on failure
			queryClient.setQueryData( [ USE_EDGE_CACHE_QUERY_KEY, siteId ], Boolean( prevValue ) );

			dispatch(
				createNotice(
					'is-error',
					active ? __( 'Failed to enable edge cache.' ) : __( 'Failed to disable edge cache.' ),
					{ duration: 5000, id: EDGE_CACHE_ENABLE_DISABLE_NOTICE_ID }
				)
			);

			options?.onError?.( ...args );
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
		( siteId: number | null, active: boolean ) => {
			dispatch(
				createNotice(
					'is-plain',
					active ? __( 'Enabling edge cache…' ) : __( 'Disabling edge cache…' ),
					{
						duration: 5000,
						id: EDGE_CACHE_ENABLE_DISABLE_NOTICE_ID,
					}
				)
			);

			mutate( { siteId, active } );
		},
		[ dispatch, mutate, __ ]
	);

	return { setEdgeCache, ...rest };
};

export const useClearEdgeCacheMutation = (
	siteId: number | null,
	options: UseMutationOptions< MutationResponse, MutationError > = {}
) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	return useMutation( {
		mutationFn: () => purgeEdgeCache( siteId ),
		...options,
		mutationKey: [ CLEAR_EDGE_CACHE_MUTATION_KEY, siteId ],
		onSuccess() {
			dispatch(
				successNotice( translate( 'Successfully cleared edge cache.' ), {
					duration: 5000,
				} )
			);
		},
		onError() {
			dispatch( errorNotice( translate( 'Failed to clear edge cache.' ) ) );
		},
	} );
};
