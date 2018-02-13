/** @format */

/**
 * Internal dependencies
 */
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	updateJetpackRemoteInstallError,
	jetpackRemoteInstallComplete,
} from 'state/jetpack-remote-install/actions';
import { JETPACK_REMOTE_INSTALL } from 'state/action-types';

export const installJetpackPlugin = action =>
	http(
		{
			method: 'POST',
			path: '/jetpack-install/' + action.url,
			query: {
				user: action.user,
				password: action.password,
			},
		},
		action
	);

export const handleResponse = ( { url }, data ) => {
	if ( data.status ) {
		return jetpackRemoteInstallComplete( url );
	}
	return updateJetpackRemoteInstallError( url, data.error );
};

export const handleError = ( { url } ) => {
	return updateJetpackRemoteInstallError( url, 'API_ERROR' );
};

export default {
	[ JETPACK_REMOTE_INSTALL ]: [
		dispatchRequestEx( {
			fetch: installJetpackPlugin,
			onSuccess: handleResponse,
			onError: handleError,
		} ),
	],
};
