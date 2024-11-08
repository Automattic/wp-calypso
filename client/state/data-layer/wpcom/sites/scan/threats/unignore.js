import { JETPACK_SCAN_THREAT_UNIGNORE } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import * as sitesAlertsUnignoreHandlers from 'calypso/state/data-layer/wpcom/sites/alerts/unignore';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { requestScanStatus } from 'calypso/state/jetpack-scan/actions';
import { requestJetpackScanHistory } from 'calypso/state/jetpack-scan/history/actions';
import { updateThreat, updateThreatCompleted } from 'calypso/state/jetpack-scan/threats/actions';

export const request = ( action ) => {
	const defaultActions = sitesAlertsUnignoreHandlers.request( action );
	return [ updateThreat( action.siteId, action.threatId ), ...defaultActions ];
};

export const success = ( action, rewindState ) => {
	const defaultActions = sitesAlertsUnignoreHandlers.success( action, rewindState );
	return [
		...defaultActions,
		requestScanStatus( action.siteId, false ),
		requestJetpackScanHistory( action.siteId ),
	];
};

export const failure = ( action ) => {
	const defaultAction = sitesAlertsUnignoreHandlers.failure( action );
	return [ defaultAction, updateThreatCompleted( action.siteId, action.threatId ) ];
};

registerHandlers( 'state/data-layer/wpcom/sites/scan/threats/unignore.js', {
	[ JETPACK_SCAN_THREAT_UNIGNORE ]: [
		dispatchRequest( {
			fetch: request,
			onSuccess: success,
			onError: failure,
		} ),
	],
} );
