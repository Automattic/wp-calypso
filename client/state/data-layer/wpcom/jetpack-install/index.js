/** @format */

/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	updateJetpackRemoteInstallError,
	jetpackRemoteInstallComplete,
} from 'state/jetpack-remote-install/actions';
import { JETPACK_REMOTE_INSTALL } from 'state/action-types';

export const installJetpackPlugin = ( { dispatch }, action ) => {
	const { url, user, password } = action;
	return dispatch(
		http(
			{
				method: 'POST',
				path: '/jetpack-install/' + url,
				query: {
					user,
					password,
				},
			},
			action
		)
	);
};

const handleResponse = ( { dispatch }, { url }, data ) => {
	if ( data.status ) {
		return dispatch( jetpackRemoteInstallComplete( url ) );
	}
	dispatch( updateJetpackRemoteInstallError( url, data.error ) );
};

const handleError = ( { dispatch }, { url } ) => {
	dispatch( updateJetpackRemoteInstallError( url, 'API_ERROR' ) );
};

export default {
	[ JETPACK_REMOTE_INSTALL ]: [
		dispatchRequest( installJetpackPlugin, handleResponse, handleError ),
	],
};
