import { useQuery } from '@tanstack/react-query';
import { useDispatch } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { getProductionSiteId, isStagingSiteSyncing } from '../../utils/site-staging-site';
import { stagingSiteSyncStateQuery } from '../queries/site-staging-sites';
import type { Site } from '../../data/types';

interface StagingSiteSyncMonitorProps {
	site: Site;
}

export default function StagingSiteSyncMonitor( { site }: StagingSiteSyncMonitorProps ) {
	const productionSiteId = getProductionSiteId( site );

	const { data: stagingSiteSyncState } = useQuery( {
		...stagingSiteSyncStateQuery( productionSiteId ?? 0 ),
		enabled: !! productionSiteId,
		refetchInterval: ( query ) => {
			return isStagingSiteSyncing( query.state.data ) ? 5000 : false;
		},
		refetchIntervalInBackground: true,
	} );

	const isSyncing = isStagingSiteSyncing( stagingSiteSyncState );
	const wasSyncingRef = useRef( false );

	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	useEffect( () => {
		if ( ! productionSiteId || ! stagingSiteSyncState ) {
			return;
		}

		if ( wasSyncingRef.current && ! isSyncing ) {
			if ( stagingSiteSyncState?.status === 'completed' ) {
				createSuccessNotice( __( 'Synchronization completed successfully.' ), {
					type: 'snackbar',
					explicitDismiss: true,
				} );
			} else if (
				stagingSiteSyncState?.status === 'failed' ||
				stagingSiteSyncState?.status === 'allow_retry'
			) {
				createErrorNotice( __( 'Synchronization failed. Please try again.' ), {
					type: 'snackbar',
					explicitDismiss: true,
				} );
			}
		}

		wasSyncingRef.current = !! isSyncing;
	}, [
		isSyncing,
		stagingSiteSyncState,
		createSuccessNotice,
		createErrorNotice,
		productionSiteId,
	] );

	return null;
}
