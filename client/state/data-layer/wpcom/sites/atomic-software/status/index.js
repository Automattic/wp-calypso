import { ATOMIC_PLUGIN_INSTALL_REQUEST_STATUS } from 'calypso/state/action-types';
import { setAtomicInstallStatus } from 'calypso/state/atomic-transfer-with-plugin/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';

const requestSoftwareInstallStatus = ( action ) =>
	http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'POST',
			path: `/sites/${ action.siteId }/atomic/software/${ action.softwareSet }`,
		},
		action
	);

export const receiveError = ( action, { error } ) => {
	setAtomicInstallStatus( action.siteId, action.softwareSet, error );
};

export const receiveResponse = ( action, { success } ) => {
	setAtomicInstallStatus( action.siteId, action.softwareSet, success.applied );
};

registerHandlers( 'state/data-layer/wpcom/sites/atomic-software/status', {
	[ ATOMIC_PLUGIN_INSTALL_REQUEST_STATUS ]: [
		dispatchRequest( {
			fetch: requestSoftwareInstallStatus,
			onSuccess: receiveResponse,
			onError: receiveError,
		} ),
	],
} );
