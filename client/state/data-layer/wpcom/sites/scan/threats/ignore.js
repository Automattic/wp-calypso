/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { JETPACK_SCAN_THREAT_IGNORE } from 'state/action-types';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { requestScanStatus } from 'state/jetpack-scan/actions';
import { requestJetpackScanHistory } from 'state/jetpack-scan/history/actions';
import { updateThreat, updateThreatCompleted } from 'state/jetpack-scan/threats/actions';
import * as sitesAlertsIgnoreHandlers from 'state/data-layer/wpcom/sites/alerts/ignore';

export const request = ( action ) => {
	const defaultActions = sitesAlertsIgnoreHandlers.request( action );
	return [ updateThreat( action.siteId, action.threatId ), ...defaultActions ];
};

export const success = ( action, rewindState ) => {
	const defaultActions = sitesAlertsIgnoreHandlers.success( action, rewindState );
	return [
		...defaultActions,
		requestScanStatus( action.siteId, false ),
		requestJetpackScanHistory( action.siteId ),
	];
};

export const failure = ( action ) => {
	const defaultAction = sitesAlertsIgnoreHandlers.failure( action );
	return [ defaultAction, updateThreatCompleted( action.siteId, action.threatId ) ];
};

registerHandlers( 'state/data-layer/wpcom/sites/scan/threats/ignore.js', {
	[ JETPACK_SCAN_THREAT_IGNORE ]: [
		dispatchRequest( {
			fetch: request,
			onSuccess: success,
			onError: failure,
		} ),
	],
} );
