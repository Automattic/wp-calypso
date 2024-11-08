import { useMutation, UseMutationOptions, useIsMutating } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';

type MutationVariables = string[] | undefined;

interface PushStagingMutationResponse {
	message: string;
}

interface PushStagingMutationError {
	code: string;
	message: string;
}

export const PUSH_TO_STAGING = 'push-to-staging-site-mutation-key';
export const PULL_FROM_STAGING = 'pull-from-staging-site-mutation-key';

export const usePushToStagingMutation = (
	productionSiteId: number,
	stagingSiteId: number,
	options: UseMutationOptions< PushStagingMutationResponse, PushStagingMutationError >
) => {
	const mutation = useMutation( {
		mutationFn: async () =>
			wp.req.post( {
				path: `/sites/${ productionSiteId }/staging-site/push-to-staging/${ stagingSiteId }`,
				apiNamespace: 'wpcom/v2',
			} ),
		...options,
		mutationKey: [ PUSH_TO_STAGING, stagingSiteId ],
		onSuccess: async ( ...args ) => {
			options.onSuccess?.( ...args );
		},
	} );

	const { mutate } = mutation;
	// isMutating is returning a number. Greater than 0 means we have some pending mutations for
	// the provided key. This is preserved across different pages, while isLoading it's not.
	// TODO: Remove that when react-query v5 is out. They seem to have added isPending variable for this.
	const isLoading = useIsMutating( { mutationKey: [ PUSH_TO_STAGING, stagingSiteId ] } ) > 0;

	return { pushToStaging: mutate, isLoading };
};

export const usePullFromStagingMutation = (
	productionSiteId: number,
	stagingSiteId: number,
	options: UseMutationOptions<
		PushStagingMutationResponse,
		PushStagingMutationError,
		MutationVariables
	>
) => {
	const mutation = useMutation( {
		mutationFn: async ( options ) =>
			wp.req.post(
				{
					path: `/sites/${ productionSiteId }/staging-site/pull-from-staging/${ stagingSiteId }`,
					apiNamespace: 'wpcom/v2',
				},
				{ options, allow_woo_sync: 1 }
			),
		...options,
		mutationKey: [ PULL_FROM_STAGING, stagingSiteId ],
		onSuccess: async ( ...args ) => {
			options.onSuccess?.( ...args );
		},
	} );

	const { mutate } = mutation;
	// isMutating is returning a number. Greater than 0 means we have some pending mutations for
	// the provided key. This is preserved across different pages, while isLoading it's not.
	// TODO: Remove that when react-query v5 is out. They seem to have added isPending variable for this.
	const isLoading = useIsMutating( { mutationKey: [ PULL_FROM_STAGING, stagingSiteId ] } ) > 0;
	const pullFromStaging = useCallback( ( args: MutationVariables ) => mutate( args ), [ mutate ] );

	return { pullFromStaging, isLoading };
};
