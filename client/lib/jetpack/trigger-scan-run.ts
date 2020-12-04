/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	requestJetpackScanEnqueue,
	startScanOptimistically,
} from 'calypso/state/jetpack-scan/enqueue/actions';

export const triggerScanRun = ( siteId: number ) => ( dispatch: Function ) => {
	dispatch(
		recordTracksEvent( 'calypso_jetpack_scan_run', {
			site_id: siteId,
		} )
	);

	dispatch( requestJetpackScanEnqueue( siteId ) );
	dispatch( startScanOptimistically( siteId ) );
};
