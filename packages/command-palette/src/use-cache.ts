/*import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback } from 'react';
import request from 'wpcom-proxy-request';

export const EDGE_CACHE_ENABLE_DISABLE_NOTICE_ID = 'edge-cache-enable-disable-notice';
export const USE_EDGE_CACHE_QUERY_KEY = 'edge-cache-key';
export const TOGGLE_EDGE_CACHE_MUTATION_KEY = 'set-edge-site-mutation-key';

interface SetEdgeCacheMutationVariables {
	siteId: number;
	active: boolean;
}

interface MutationError {
	code: string;
	message: string;
}

export const getEdgeCacheStatus = async ( siteId: number ) => {
	return await request( {
		path: `/sites/${ siteId }/hosting/edge-cache/active`,
		apiNamespace: 'wpcom/v2',
		apiVersion: '2',
	} );
};

export const purgeEdgeCache = async ( siteId: number ) => {
	return await request( {
		path: `/sites/${ siteId }/hosting/edge-cache/purge`,
		apiNamespace: 'wpcom/v2',
		apiVersion: '2',
		method: 'POST',
	} );
};

export const useSetEdgeCacheMutation = (
	options: UseMutationOptions< boolean, MutationError, SetEdgeCacheMutationVariables > = {},
	createNotice
) => {
	const { __ } = useI18n();
	const queryClient = useQueryClient();
	const mutation = useMutation< boolean, MutationError, SetEdgeCacheMutationVariables >( {
		...options,
		mutationFn: async ( { active, siteId } ) => {
			return await request( {
				path: `/sites/${ siteId }/hosting/edge-cache/active`,
				apiNamespace: 'wpcom/v2',
				apiVersion: '2',
				method: 'POST',
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
			createNotice(
				'is-success',
				active ? __( 'Edge cache enabled.' ) : __( 'Edge cache disabled.' ),
				{
					duration: 5000,
					id: EDGE_CACHE_ENABLE_DISABLE_NOTICE_ID,
				}
			);
			options?.onSuccess?.( ...args );
		},
		onError( ...args ) {
			const [ , { active, siteId }, prevValue ] = args;
			// Revert to previous settings on failure
			queryClient.setQueryData( [ USE_EDGE_CACHE_QUERY_KEY, siteId ], Boolean( prevValue ) );

			createNotice(
				'is-error',
				active ? __( 'Failed to enable edge cache.' ) : __( 'Failed to disable edge cache.' ),
				{ duration: 5000, id: EDGE_CACHE_ENABLE_DISABLE_NOTICE_ID }
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
		( siteId: number, active: boolean ) => {
			createNotice(
				'is-plain',
				active ? __( 'Enabling edge cache…' ) : __( 'Disabling edge cache…' ),
				{
					duration: 5000,
					id: EDGE_CACHE_ENABLE_DISABLE_NOTICE_ID,
				}
			);

			mutate( { siteId, active } );
		},
		[ createNotice, __, mutate ]
	);

	return { setEdgeCache, ...rest };
};*/
