/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { JETPACK_SCAN_THREAT_FIX } from 'state/action-types';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { requestScanStatus } from 'state/jetpack-scan/actions';
import { requestJetpackScanHistory } from 'state/jetpack-scan/history/actions';
import { updateThreat, updateThreatCompleted } from 'state/jetpack-scan/threats/actions';
import * as sitesAlertsFixHandlers from 'state/data-layer/wpcom/sites/alerts/fix';

export const request = ( action ) => {
	const defaultActions = sitesAlertsFixHandlers.request( action );
	return [ updateThreat( action.siteId, action.threatId ), ...defaultActions ];
};

export const success = ( action, rewindState ) => {
	const defaultActions = sitesAlertsFixHandlers.success( action, rewindState );
	return [
		...defaultActions,
		requestScanStatus( action.siteId, true ),
		// Since we can fix threats from the History section, we need to update that
		// information as well.
		requestJetpackScanHistory( action.siteId ),
	];
};

export const failure = ( action ) => {
	const defaultAction = sitesAlertsFixHandlers.failure( action );
	return [ defaultAction, updateThreatCompleted( action.siteId, action.threatId ) ];
};

registerHandlers( 'state/data-layer/wpcom/sites/scan/threats/fix.js', {
	[ JETPACK_SCAN_THREAT_FIX ]: [
		dispatchRequest( {
			fetch: request,
			onSuccess: success,
			onError: failure,
		} ),
	],
} );
