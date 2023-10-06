import { useEffect, useMemo, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { fetchSyncStatus, setSyncInProgress } from 'calypso/state/sync/actions';
import { SiteSyncStatus } from 'calypso/state/sync/constants';
import { getSyncStatus, getSyncProgress, getSyncSiteType } from 'calypso/state/sync/selectors';
import { getIsSyncingInProgress } from 'calypso/state/sync/selectors/get-is-syncing-in-progress';
import { getSyncStatusError } from 'calypso/state/sync/selectors/get-sync-status-error';

export const useCheckSyncStatus = ( siteId: number ) => {
	const dispatch = useDispatch();

	const intervalIdRef = useRef< NodeJS.Timer >();
	const syncStatus = useSelector( ( state ) => getSyncStatus( state, siteId ) );
	const syncProgress = useSelector( ( state ) => getSyncProgress( state, siteId ) );
	const isSyncInProgress = useSelector( ( state ) => getIsSyncingInProgress( state, siteId ) );
	const syncStatusError = useSelector( ( state ) => getSyncStatusError( state, siteId ) );
	const syncingSiteType = useSelector( ( state ) => getSyncSiteType( state, siteId ) );

	const clearIntervalId = useCallback( () => {
		if ( intervalIdRef.current ) {
			clearInterval( intervalIdRef.current );
			intervalIdRef.current = undefined;
		}
	}, [] );

	useEffect( () => {
		if ( ! siteId || syncStatus === SiteSyncStatus.COMPLETED ) {
			dispatch( setSyncInProgress( siteId, false ) );
			clearIntervalId();
			return;
		}

		if ( isSyncInProgress === true && ! intervalIdRef.current ) {
			intervalIdRef.current = setInterval( () => dispatch( fetchSyncStatus( siteId ) ), 5000 );
		}

		return clearIntervalId;
	}, [ clearIntervalId, dispatch, siteId, syncStatus, isSyncInProgress ] );

	const resetSyncStatus = useCallback( () => {
		if ( ! siteId ) {
			return;
		}
		clearIntervalId();
		dispatch( setSyncInProgress( siteId, true ) );
	}, [ dispatch, siteId, clearIntervalId ] );

	// Fetch the status once on mount to avoid waiting the interval delay
	useEffect( () => {
		if ( ! siteId ) {
			return;
		}
		dispatch( fetchSyncStatus( siteId ) );
	}, [ dispatch, siteId ] );

	return useMemo(
		() => ( {
			status: syncStatus,
			progress: syncProgress,
			resetSyncStatus,
			isSyncInProgress,
			error: syncStatusError,
			siteType: syncingSiteType,
		} ),
		[
			syncStatus,
			syncProgress,
			resetSyncStatus,
			isSyncInProgress,
			syncStatusError,
			syncingSiteType,
		]
	);
};
