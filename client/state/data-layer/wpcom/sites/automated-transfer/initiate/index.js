/**
 * Internal dependencies
 */
import { AUTOMATED_TRANSFER_INITIATE_WITH_PLUGIN_ZIP } from 'state/action-types';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { updatePluginUploadProgress, pluginUploadError } from 'state/plugins/upload/actions';
import { getAutomatedTransferStatus } from 'state/automated-transfer/actions';

/*
 * Currently this module is only used for initiating transfers
 * with a plugin zip file. For initiating with a plugin ID
 * or theme zip, see state/themes/actions#initiateThemeTransfer.
 */

export const initiateTransferWithPluginZip = ( { dispatch }, action ) => {
	const { siteId, pluginZip } = action;

	dispatch( http( {
		method: 'POST',
		path: `/sites/${ siteId }/automated-transfers/initiate`,
		apiVersion: '1',
		formData: [ [ 'plugin_zip', pluginZip ] ],
	}, action ) );
};

export const receiveResponse = ( { dispatch }, { siteId } ) => {
	dispatch( getAutomatedTransferStatus( siteId ) );
};

export const receiveError = ( { dispatch }, { siteId }, error ) => {
	dispatch( pluginUploadError( siteId, error ) );
};

export const updateUploadProgress = ( { dispatch }, { siteId }, { loaded, total } ) => {
	const progress = total ? ( loaded / total ) * 100 : 0;
	dispatch( updatePluginUploadProgress( siteId, progress ) );
};

export default {
	[ AUTOMATED_TRANSFER_INITIATE_WITH_PLUGIN_ZIP ]: [ dispatchRequest(
		initiateTransferWithPluginZip,
		receiveResponse,
		receiveError,
		{ onProgress: updateUploadProgress }
	) ]
};
