import { useMutation, UseMutationOptions, useIsMutating, MutationKey } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import wp from 'calypso/lib/wp';

type MutationVariables = {
	targetSiteId: number;
	sourceSiteId: number;
};

interface MutationResponse {
	message: string;
}

interface MutationError {
	code: string;
	message: string;
}

export const PUSH_TO_STAGING = 'push-to-staging-site-mutation-key';
const pushSyncMutation =
	( sitePath: string, key: MutationKey ) =>
	< X, Y, Z, W >( options: UseMutationOptions< X, Y, Z, W > ) => {
		const mutation = useMutation( {
			mutationFn: async ( { targetSiteId, sourceSiteId } ) =>
				wp.req.post( {
					path: `/sites/${ sourceSiteId }/${ sitePath }/${ targetSiteId }`,
					apiNamespace: 'wpcom/v2',
				} ),
			...options,
			mutationKey: key,
			onSuccess: async ( ...args ) => {
				options.onSuccess?.( ...args );
			},
		} );

		const { mutate } = mutation;
		// isMutating is returning a number. Greater than 0 means we have some pending mutations for
		// the provided key. This is preserved across different pages, while isLoading it's not.
		// TODO: Remove that when react-query v5 is out. They seem to have added isPending variable for this.
		const isLoading = useIsMutating( { mutationKey: key } ) > 0;

		const pushTo = useCallback( ( args: Z ) => mutate( args ), [ mutate ] );

		return { pushTo, isLoading };
	};

export const usePushToStagingMutation = (
	productionSiteId: number,
	options: UseMutationOptions< MutationResponse, MutationError, MutationVariables >
) => {
	const usePushToStagingHook = pushSyncMutation( 'staging-site/push-to-staging', [
		PUSH_TO_STAGING,
		productionSiteId,
	] as MutationKey );
	const data = usePushToStagingHook( options );
	return useMemo(
		() => ( {
			...data,
			pushToStaging: ( stagingSiteId: number ) =>
				data.pushTo( {
					sourceSiteId: productionSiteId,
					targetSiteId: stagingSiteId,
				} ),
		} ),
		[ data, productionSiteId ]
	);
};

export const usePullFromProductionMutation = (
	stagingSiteId: number,
	options: UseMutationOptions< MutationResponse, MutationError, MutationVariables >
) => {
	const usePushToStagingHook = pushSyncMutation( 'staging-site/pull-from-production', [
		PUSH_TO_STAGING,
		stagingSiteId,
	] as MutationKey );
	const data = usePushToStagingHook( options );

	return useMemo(
		() => ( {
			...data,
			pullFromProduction: ( productionSiteid: number ) => {
				data.pushTo( {
					sourceSiteId: productionSiteid,
					targetSiteId: stagingSiteId,
				} );
			},
		} ),
		[ data, stagingSiteId ]
	);
};
