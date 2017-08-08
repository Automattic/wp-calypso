/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { find, includes, toLower } from 'lodash';

/**
 * Internal dependencies
 */
import { PLUGIN_UPLOAD, PLUGIN_INSTALL_REQUEST_SUCCESS } from 'state/action-types';
import {
	completePluginUpload,
	pluginUploadError,
	updatePluginUploadProgress,
} from 'state/plugins/upload/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { successNotice, errorNotice } from 'state/notices/actions';
import { recordTracksEvent } from 'state/analytics/actions';

export const uploadPlugin = ( { dispatch }, action ) => {
	const { siteId, file } = action;

	dispatch( recordTracksEvent( 'calypso_plugin_upload' ) );

	dispatch( http( {
		method: 'POST',
		path: `/sites/${ siteId }/plugins/new`,
		apiVersion: '1',
		formData: [ [ 'zip[]', file ] ],
	}, action ) );
};

const showSuccessNotice = ( dispatch, { name } ) => {
	dispatch( successNotice(
		translate( "You've successfully uploaded the %(name)s plugin.", {
			args: { name }
		} ),
		{ duration: 5000 }
	) );
};

const showErrorNotice = ( dispatch, error ) => {
	const knownErrors = {
		exists: translate( 'This plugin is already installed on your site.' ),
		'too large': translate( 'The plugin zip file must be smaller than 10MB.' ),
		incompatible: translate( 'Not a compatible plugin.' ),
		unsupported_mime_type: translate( 'Not a valid zip file.' ),
	};
	const errorString = toLower( error.error + error.message );
	const knownError = find( knownErrors, ( v, key ) => includes( errorString, key ) );

	if ( knownError ) {
		dispatch( errorNotice( knownError ) );
		return;
	}
	if ( error.error ) {
		dispatch( errorNotice( translate( 'Upload problem: %(error)s.', {
			args: { error: error.error }
		} ) ) );
		return;
	}
	dispatch( errorNotice( translate( 'Problem installing the plugin.' ) ) );
};

export const uploadComplete = ( { dispatch }, { siteId }, next, data ) => {
	const { slug: pluginId } = data;

	dispatch( recordTracksEvent( 'calypso_plugin_upload_complete', {
		plugin_id: pluginId
	} ) );

	dispatch( completePluginUpload( siteId, pluginId ) );
	dispatch( {
		type: PLUGIN_INSTALL_REQUEST_SUCCESS,
		siteId,
		pluginId,
		data
	} );

	showSuccessNotice( dispatch, data );
};

export const receiveError = ( { dispatch }, { siteId }, next, error ) => {

	dispatch( recordTracksEvent( 'calypso_plugin_upload_error', {
		error_code: error.error,
		error_message: error.message
	} ) );

	showErrorNotice( dispatch, error );
	dispatch( pluginUploadError( siteId, error ) );
};

export const updateUploadProgress = ( { dispatch }, { siteId }, next, { loaded, total } ) => {
	const progress = total ? ( loaded / total ) * 100 : total;
	dispatch( updatePluginUploadProgress( siteId, progress ) );
};

export default {
	[ PLUGIN_UPLOAD ]: [ dispatchRequest(
		uploadPlugin,
		uploadComplete,
		receiveError,
		updateUploadProgress
	) ]
};

