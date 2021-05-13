/**
 * External dependencies
 */
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import {
	jetpackRemoteInstallComplete,
	jetpackRemoteInstallUpdateError,
} from 'calypso/state/jetpack-remote-install/actions';
import { JETPACK_REMOTE_INSTALL } from 'calypso/state/action-types';
import { recordTracksEvent, withAnalytics } from 'calypso/state/analytics/actions';

import { registerHandlers } from 'calypso/state/data-layer/handler-registry';

export const JETPACK_REMOTE_INSTALL_RETRIES = 3;

export const installJetpackPlugin = ( action ) =>
	http(
		{
			method: 'POST',
			path: '/jetpack-install/' + encodeURIComponent( action.url ),
			query: {
				user: action.user,
				password: action.password,
			},
		},
		action
	);

export const handleSuccess = ( { url } ) => {
	const logToTracks = withAnalytics(
		recordTracksEvent( 'calypso_jpc_remoteinstall_api_success', {
			url,
		} )
	);

	return logToTracks( jetpackRemoteInstallComplete( url ) );
};

export const handleError = ( action, error ) => {
	const {
		url,
		user,
		password,
		meta: { dataLayer },
	} = action;
	const { retryCount = 0 } = dataLayer;

	const logToTracks = withAnalytics(
		recordTracksEvent( 'calypso_jpc_remoteinstall_api_fail', {
			url,
			error: error.error,
			error_message: error.message,
			status: error.status,
		} )
	);

	if ( includes( error.message, 'timed out' ) ) {
		if ( retryCount < JETPACK_REMOTE_INSTALL_RETRIES ) {
			return {
				type: JETPACK_REMOTE_INSTALL,
				url,
				user,
				password,
				meta: {
					dataLayer: {
						retryCount: retryCount + 1,
						trackRequest: true,
					},
				},
			};
		}
	}

	return logToTracks( jetpackRemoteInstallUpdateError( url, error.error, error.message ) );
};

registerHandlers( 'state/data-layer/wpcom/jetpack-install/index.js', {
	[ JETPACK_REMOTE_INSTALL ]: [
		dispatchRequest( {
			fetch: installJetpackPlugin,
			onSuccess: handleSuccess,
			onError: handleError,
		} ),
	],
} );

export default {};
