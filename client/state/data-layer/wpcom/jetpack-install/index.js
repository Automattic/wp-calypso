/** @format */
/**
 * Internal dependencies
 */
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	jetpackRemoteInstallComplete,
	jetpackRemoteInstallUpdateError,
} from 'state/jetpack-remote-install/actions';
import { JETPACK_REMOTE_INSTALL } from 'state/action-types';
import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';

export const installJetpackPlugin = action =>
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

export const handleSuccess = ( { url }, data ) => {
	const logToTracks = withAnalytics(
		recordTracksEvent( 'calypso_jpc_remote_install_api_response', {
			remote_site_url: url,
			data: JSON.stringify( data ),
		} )
	);

	if ( data.status ) {
		return logToTracks( jetpackRemoteInstallComplete( url ) );
	}
	return logToTracks( jetpackRemoteInstallUpdateError( url, 'UNKNOWN_ERROR' ) );
};

export const handleError = ( { url }, error ) => {
	const logToTracks = withAnalytics(
		recordTracksEvent( 'calypso_jpc_remote_install_api_response', {
			remote_site_url: url,
			data: JSON.stringify( error ),
		} )
	);

	return logToTracks( jetpackRemoteInstallUpdateError( url, error.error, error.message ) );
};

export default {
	[ JETPACK_REMOTE_INSTALL ]: [
		dispatchRequestEx( {
			fetch: installJetpackPlugin,
			onSuccess: handleSuccess,
			onError: handleError,
		} ),
	],
};
