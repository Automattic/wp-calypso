import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';
import wpcom from 'calypso/lib/wp';
import { fetchAutomatedTransferStatus } from 'calypso/state/automated-transfer/actions';
import { TransferStates } from 'calypso/state/automated-transfer/constants';
import { SiteId } from 'calypso/types';
import { useIsStatusReverting } from './use-is-status-reverting';
import { USE_STAGING_SITE_QUERY_KEY } from './use-staging-site';

interface UseDeleteStagingSiteOptions {
	siteId: SiteId;
	stagingSiteId: SiteId;
	transferStatus: TransferStates | null;
	onSuccess?: () => void;
	onError?: () => void;
}

export const useDeleteStagingSite = ( options: UseDeleteStagingSiteOptions ) => {
	const { siteId, stagingSiteId, transferStatus, onSuccess, onError } = options;
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const [ isDeletingInitiated, setIsDeletingInitiated ] = useState( false );
	const onReverted = useCallback( () => {
		queryClient.invalidateQueries( [ USE_STAGING_SITE_QUERY_KEY ] );
		setIsDeletingInitiated( false );
		onSuccess?.();
	}, [ onSuccess, queryClient ] );

	const isStatusReverting = useIsStatusReverting( transferStatus );

	useEffect( () => {
		let timeoutId: NodeJS.Timeout;
		if ( isDeletingInitiated ) {
			if ( stagingSiteId ) {
				timeoutId = setInterval( () => {
					queryClient.invalidateQueries( [ USE_STAGING_SITE_QUERY_KEY ] );
				}, 3000 );
			} else {
				onReverted();
			}
		}
		return () => {
			clearInterval( timeoutId );
		};
	}, [ isDeletingInitiated, onReverted, queryClient, stagingSiteId ] );

	const mutation = useMutation(
		() => {
			return wpcom.req.post( {
				method: 'DELETE',
				path: `/sites/${ siteId }/staging-site/${ stagingSiteId }`,
				apiNamespace: 'wpcom/v2',
			} );
		},
		{
			onSuccess: async () => {
				// Wait for the staging site async job to start
				setTimeout( () => {
					dispatch( fetchAutomatedTransferStatus( stagingSiteId ) );
				}, 3000 );
			},
			onError: () => {
				setIsDeletingInitiated( false );
				onError?.();
			},
		}
	);
	const { mutate, isLoading } = mutation;

	useEffect( () => {
		if ( isLoading ) {
			setIsDeletingInitiated( true );
		}
	}, [ isLoading ] );

	return { deleteStagingSite: mutate, isReverting: isStatusReverting || isDeletingInitiated };
};
