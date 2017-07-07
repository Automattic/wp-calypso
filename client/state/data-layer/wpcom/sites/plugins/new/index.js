/**
 * Internal dependencies
 */
import { PLUGIN_UPLOAD, PLUGIN_INSTALL_REQUEST_SUCCESS } from 'state/action-types';
import {
	completePluginUpload,
} from 'state/plugins/upload/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';

const uploadPlugin = ( { dispatch }, action ) => {
	const { siteId, file } = action;

	dispatch( http( {
		method: 'POST',
		path: `/sites/${ siteId }/plugins/new`,
		apiVersion: '1',
		formData: [ [ 'zip[]', file ] ],
	}, action ) );
};

const uploadComplete = ( { dispatch }, { siteId }, next, data ) => {
	const { pluginId } = data;
	dispatch( completePluginUpload( siteId, pluginId ) );
	dispatch( {
		type: PLUGIN_INSTALL_REQUEST_SUCCESS,
		siteId,
		pluginId,
		data
	} );
};

export default {
	[ PLUGIN_UPLOAD ]: [ dispatchRequest( uploadPlugin, uploadComplete ) ]
};

