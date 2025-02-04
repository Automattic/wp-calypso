import { useIsMutating, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import wpcom from 'calypso/lib/wp';
import { useDispatch } from 'calypso/state';
import { fetchAutomatedTransferStatus } from 'calypso/state/automated-transfer/actions';
import { TransferStates } from 'calypso/state/automated-transfer/constants';
import { SiteId } from 'calypso/types';
import { useIsStatusReverting } from './use-is-status-reverting';
import { USE_STAGING_SITE_QUERY_KEY } from './use-staging-site';

interface UseDeleteStagingSiteOptions {
	siteId: SiteId;
	stagingSiteId: SiteId;
	transferStatus: TransferStates | null;
	onMutate?: () => void;
	onSuccess?: () => void;
	onError?: ( error: MutationError ) => void;
}

interface MutationError {
	code: string;
	message: string;
}

export const DELETE_STAGING_SITE_MUTATION_KEY = 'delete-staging-site-mutation-key';

export const useDeleteStagingSite = ( options: UseDeleteStagingSiteOptions ) => {
	const { siteId, stagingSiteId, transferStatus, onMutate, onSuccess, onError } = options;
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const [ isDeletingInitiated, setIsDeletingInitiated ] = useState( false );
	const onReverted = useCallback( () => {
		queryClient.invalidateQueries( {
			queryKey: [ USE_STAGING_SITE_QUERY_KEY ],
		} );
		setIsDeletingInitiated( false );
		onSuccess?.();
	}, [ onSuccess, queryClient ] );

	const isStatusReverting = useIsStatusReverting( transferStatus );

	useEffect( () => {
		let timeoutId: NodeJS.Timeout;
		if ( isDeletingInitiated ) {
			if ( stagingSiteId ) {
				timeoutId = setInterval( () => {
					queryClient.invalidateQueries( {
						queryKey: [ USE_STAGING_SITE_QUERY_KEY ],
					} );
				}, 3000 );
			} else {
				onReverted();
			}
		}
		return () => {
			clearInterval( timeoutId );
		};
	}, [ isDeletingInitiated, onReverted, queryClient, stagingSiteId ] );

	const mutation = useMutation( {
		mutationFn: () => {
			return wpcom.req.post( {
				method: 'DELETE',
				path: `/sites/${ siteId }/staging-site/${ stagingSiteId }`,
				apiNamespace: 'wpcom/v2',
			} );
		},
		mutationKey: [ DELETE_STAGING_SITE_MUTATION_KEY, siteId ],
		onMutate: () => {
			onMutate?.();
		},
		onSuccess: async () => {
			// Wait for the staging site async job to start
			setTimeout( () => {
				dispatch( fetchAutomatedTransferStatus( stagingSiteId ) );
			}, 3000 );
		},
		onError: ( error: MutationError ) => {
			setIsDeletingInitiated( false );
			onError?.( error );
		},
	} );

	// isMutating is returning a number. Greater than 0 means we have some pending mutations for
	// the provided key. This is preserved across different pages, while isLoading it's not.
	// TODO: Remove that when react-query v5 is out. They seem to have added isPending variable for this.
	const isLoading =
		useIsMutating( { mutationKey: [ DELETE_STAGING_SITE_MUTATION_KEY, siteId ] } ) > 0;
	const { mutate } = mutation;

	useEffect( () => {
		if ( isLoading ) {
			setIsDeletingInitiated( true );
		}
	}, [ isLoading ] );

	return {
		deleteStagingSite: mutate,
		isLoading,
		isReverting: isStatusReverting || isDeletingInitiated,
	};
};
