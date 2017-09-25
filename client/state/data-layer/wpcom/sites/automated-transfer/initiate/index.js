/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { AUTOMATED_TRANSFER_INITIATE_WITH_PLUGIN_ZIP } from 'state/action-types';
import { getAutomatedTransferStatus } from 'state/automated-transfer/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
import { updatePluginUploadProgress, pluginUploadError } from 'state/plugins/upload/actions';

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
	if ( error.error ) {
		dispatch( errorNotice( translate( 'Upload problem: %(error)s.', {
			args: { error: error.error }
		} ) ) );
	} else {
		dispatch( errorNotice( translate( 'Problem uploading the plugin.' ) ) );
	}

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
