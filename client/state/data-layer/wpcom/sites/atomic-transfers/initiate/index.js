import { ATOMIC_PLUGIN_INSTALL_INITIATE_WITH_TRANSFER } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';

const initiateAtomicTransferandInstall = ( action ) =>
	http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'POST',
			path: `/sites/${ action.siteId }/atomic/transfers/`,
			body: {
				software_set: action.softwareSet,
			},
		},
		action
	);

export const receiveError = ( error ) => {
	return error;
};

export const receiveResponse = ( action, { success } ) => {
	return success;
};

registerHandlers( 'state/data-layer/wpcom/sites/atomic-transfers/initiate', {
	[ ATOMIC_PLUGIN_INSTALL_INITIATE_WITH_TRANSFER ]: [
		dispatchRequest( {
			fetch: initiateAtomicTransferandInstall,
			onSuccess: receiveResponse,
			onError: receiveError,
		} ),
	],
} );
