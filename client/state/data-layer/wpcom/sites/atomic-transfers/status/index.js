import { ATOMIC_PLUGIN_INSTALL_REQUEST_TRANSFER_STATUS } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';

const requestTransferToAtomicStatus = ( action ) =>
	http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'GET',
			path: `/sites/${ action.siteId }/atomic/transfers/`,
		},
		action
	);

export const receiveError = ( error ) => {
	return error;
};

export const receiveResponse = ( action, { success } ) => {
	return success;
};

registerHandlers( 'state/data-layer/wpcom/sites/atomic-transfers/status', {
	[ ATOMIC_PLUGIN_INSTALL_REQUEST_TRANSFER_STATUS ]: [
		dispatchRequest( {
			fetch: requestTransferToAtomicStatus,
			onSuccess: receiveResponse,
			onError: receiveError,
		} ),
	],
} );
