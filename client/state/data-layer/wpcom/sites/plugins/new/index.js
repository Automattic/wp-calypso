/**
 * External dependencies
 */

import { translate } from 'i18n-calypso';
import { find, includes } from 'lodash';

/**
 * Internal dependencies
 */
import { PLUGIN_INSTALL_REQUEST_SUCCESS, PLUGIN_UPLOAD } from 'calypso/state/action-types';
import { INSTALL_PLUGIN } from 'calypso/lib/plugins/constants';
import {
	completePluginUpload,
	pluginUploadError,
	updatePluginUploadProgress,
} from 'calypso/state/plugins/upload/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import { registerHandlers } from 'calypso/state/data-layer/handler-registry';

export const uploadPlugin = ( action ) => {
	const { siteId, file } = action;

	return [
		recordTracksEvent( 'calypso_plugin_upload' ),
		http(
			{
				method: 'POST',
				path: `/sites/${ siteId }/plugins/new`,
				apiVersion: '1',
				formData: [ [ 'zip[]', file ] ],
			},
			action
		),
	];
};

const showErrorNotice = ( error ) => {
	const knownErrors = {
		exists: translate( 'This plugin is already installed on your site.' ),
		'too large': translate( 'The plugin zip file must be smaller than 10MB.' ),
		incompatible: translate( 'The uploaded file is not a compatible plugin.' ),
		unsupported_mime_type: translate( 'The uploaded file is not a valid zip.' ),
	};
	const errorString = `${ error.error }${ error.message }`.toLowerCase();
	const knownError = find( knownErrors, ( v, key ) => includes( errorString, key ) );

	if ( knownError ) {
		return errorNotice( knownError );
	}

	if ( error.error ) {
		return errorNotice(
			translate( 'Upload problem: %(error)s.', {
				args: { error: error.error },
			} )
		);
	}

	return errorNotice( translate( 'Problem installing the plugin.' ) );
};

export const uploadComplete = ( { siteId }, data ) => ( dispatch ) => {
	const { slug: pluginId } = data;

	dispatch(
		recordTracksEvent( 'calypso_plugin_upload_complete', {
			plugin_id: pluginId,
		} )
	);

	dispatch( completePluginUpload( siteId, pluginId ) );

	// Notifying installed plugins that this plugin was successfully installed
	dispatch( {
		type: PLUGIN_INSTALL_REQUEST_SUCCESS,
		action: INSTALL_PLUGIN,
		siteId,
		pluginId: data.id,
		data,
	} );
};

export const receiveError = ( { siteId }, error ) => [
	recordTracksEvent( 'calypso_plugin_upload_error', {
		error_code: error.error,
		error_message: error.message,
	} ),
	showErrorNotice( error ),
	pluginUploadError( siteId, error ),
];

export const updateUploadProgress = ( { siteId }, { loaded, total } ) => {
	const progress = total ? ( loaded / total ) * 100 : total;

	return updatePluginUploadProgress( siteId, progress );
};

registerHandlers( 'state/data-layer/wpcom/sites/plugins/new/index.js', {
	[ PLUGIN_UPLOAD ]: [
		dispatchRequest( {
			fetch: uploadPlugin,
			onSuccess: uploadComplete,
			onError: receiveError,
			onProgress: updateUploadProgress,
		} ),
	],
} );
