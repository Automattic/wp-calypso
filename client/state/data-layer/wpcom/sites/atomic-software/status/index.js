import { ATOMIC_PLUGIN_INSTALL_REQUEST_STATUS } from 'calypso/state/action-types';
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

export const receiveError = ( error ) => {
	return error;
};

export const receiveResponse = ( action, { success } ) => {
	return success;
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
