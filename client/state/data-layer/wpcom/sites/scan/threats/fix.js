/**
 * Internal dependencies
 */
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { JETPACK_SCAN_THREAT_FIX } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { requestScanStatus } from 'calypso/state/jetpack-scan/actions';
import { requestJetpackScanHistory } from 'calypso/state/jetpack-scan/history/actions';
import { updateThreat, updateThreatCompleted } from 'calypso/state/jetpack-scan/threats/actions';
import * as sitesAlertsFixHandlers from 'calypso/state/data-layer/wpcom/sites/alerts/fix';

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
