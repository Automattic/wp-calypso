import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	requestJetpackScanEnqueue,
	startScanOptimistically,
} from 'calypso/state/jetpack-scan/enqueue/actions';
import type { Dispatch } from 'redux';

export const triggerScanRun = ( siteId: number ) => ( dispatch: Dispatch< any > ): void => {
	dispatch(
		recordTracksEvent( 'calypso_jetpack_scan_run', {
			site_id: siteId,
		} )
	);

	dispatch( requestJetpackScanEnqueue( siteId ) );
	dispatch( startScanOptimistically( siteId ) );
};
