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

export const uploadPlugin = ( { dispatch }, action ) => {
	const { siteId, file } = action;

	dispatch( http( {
		method: 'POST',
		path: `/sites/${ siteId }/plugins/new`,
		apiVersion: '1',
		formData: [ [ 'zip[]', file ] ],
	}, action ) );
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
};

export const receiveError = ( { dispatch }, { siteId }, next, error ) => {
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

