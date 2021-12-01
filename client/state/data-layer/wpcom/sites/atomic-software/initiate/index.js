import { ATOMIC_PLUGIN_INSTALL_INITIATE } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';

const initiateAtomicSoftwareInstall = ( action ) =>
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

registerHandlers( 'state/data-layer/wpcom/sites/atomic-software/initiate', {
	[ ATOMIC_PLUGIN_INSTALL_INITIATE ]: [
		dispatchRequest( {
			fetch: initiateAtomicSoftwareInstall,
			onSuccess: receiveResponse,
			onError: receiveError,
		} ),
	],
} );
