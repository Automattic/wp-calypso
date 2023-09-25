import { useMutation, UseMutationOptions, useIsMutating } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import wp from 'calypso/lib/wp';

type MutationVariables = number;

interface MutationResponse {
	message: string;
}

interface MutationError {
	code: string;
	message: string;
}

export const PUSH_TO_STAGING = 'push-to-staging-site-mutation-key';

const pushSyncMutation =
	( sitePath: string, key: string ) =>
	< X, Y, Z, W >( firstSiteId: number, options: UseMutationOptions< X, Y, Z, W > ) => {
		const mutation = useMutation( {
			mutationFn: async ( otherSiteId ) =>
				wp.req.post( {
					path: `/sites/${ firstSiteId }/${ sitePath }/${ otherSiteId }`,
					apiNamespace: 'wpcom/v2',
				} ),
			...options,
			mutationKey: [ key, firstSiteId ],
			onSuccess: async ( ...args ) => {
				options.onSuccess?.( ...args );
			},
		} );

		const { mutate } = mutation;
		// isMutating is returning a number. Greater than 0 means we have some pending mutations for
		// the provided key. This is preserved across different pages, while isLoading it's not.
		// TODO: Remove that when react-query v5 is out. They seem to have added isPending variable for this.
		const isLoading = useIsMutating( { mutationKey: [ key, firstSiteId ] } ) > 0;

		const pushTo = useCallback( ( args: MutationVariables ) => mutate( args ), [ mutate ] );

		return { pushTo, isLoading };
	};

export const usePushToStagingMutation = (
	productionSiteid: number,
	options: UseMutationOptions< MutationResponse, MutationError, MutationVariables >
) => {
	const usePushToStagingHook = pushSyncMutation( 'staging-site/push-to-staging', PUSH_TO_STAGING );
	const data = usePushToStagingHook( productionSiteid, options );
	return useMemo( () => ( { ...data, pushToStaging: data.pushTo } ), [ data ] );
};

export const usePullFromProductionMutation = (
	stagingSiteId: number,
	options: UseMutationOptions< MutationResponse, MutationError, MutationVariables >
) => {
	const usePushToStagingHook = pushSyncMutation(
		'staging-site/pull-from-production',
		PUSH_TO_STAGING
	);
	const data = usePushToStagingHook( stagingSiteId, options );
	return useMemo( () => ( { ...data, pullFromProduction: data.pushTo } ), [ data ] );
};
