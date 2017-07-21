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

export const uploadPlugin = ( { dispatch }, action ) => {
	const { siteId, file } = action;

	dispatch( http( {
		method: 'POST',
		path: `/sites/${ siteId }/plugins/new`,
		apiVersion: '1',
		formData: [ [ 'zip[]', file ] ],
	}, action ) );
};

const showSuccessNotice = ( dispatch, { name } ) => {
	dispatch( successNotice(
		translate( 'Successfully uploaded plugin %(name)s.', {
			args: { name }
		} ),
		{ duration: 5000 }
	) );
};

const showErrorNotice = ( dispatch, error ) => {
	const knownErrors = {
		exists: translate( 'Upload problem: Plugin already installed on site.' ),
		'too large': translate( 'Upload problem: Plugin zip must be smaller than 10MB.' ),
		incompatible: translate( 'Upload problem: Incompatible plugin.' ),
		unsupported_mime_type: translate( 'Upload problem: Not a valid zip file.' ),
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
	dispatch( errorNotice( translate( 'Problem uploading plugin.' ) ) );
};

export const uploadComplete = ( { dispatch }, { siteId }, next, data ) => {
	const { slug: pluginId } = data;
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

