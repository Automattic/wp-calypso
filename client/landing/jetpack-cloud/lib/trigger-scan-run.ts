/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import {
	requestJetpackScanEnqueue,
	startScanOptimistically,
} from 'state/jetpack-scan/enqueue/actions';

export const triggerScanRun = ( siteId: number ) => ( dispatch: Function ) => {
	dispatch(
		recordTracksEvent( 'jetpack_cloud_scan_run', {
			site_id: siteId,
		} )
	);

	dispatch( requestJetpackScanEnqueue( siteId ) );
	dispatch( startScanOptimistically( siteId ) );
};
