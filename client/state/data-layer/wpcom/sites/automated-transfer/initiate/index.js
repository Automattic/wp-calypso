/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { AUTOMATED_TRANSFER_INITIATE_WITH_PLUGIN_ZIP } from 'state/action-types';
import { recordTracksEvent } from 'state/analytics/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
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

	dispatch( recordTracksEvent(
		'calypso_automated_transfer_inititate_transfer',
		{ context: 'plugin_upload' }
	) );

	dispatch( http( {
		method: 'POST',
		path: `/sites/${ siteId }/automated-transfers/initiate`,
		apiVersion: '1',
		formData: [ [ 'plugin_zip', pluginZip ] ],
	}, action ) );
};

export const receiveResponse = ( { dispatch }, { siteId } ) => {
	dispatch( recordTracksEvent(
		'calypso_automated_transfer_inititate_success',
		{ context: 'plugin_upload' }
	) );
	dispatch( getAutomatedTransferStatus( siteId ) );
};

const showErrorNotice = ( dispatch, error ) => {
	if ( error.error === 'invalid_input' ) {
		dispatch( errorNotice( translate( 'Not a valid zip file.' ) ) );
		return;
	}
	if ( error.error ) {
		dispatch( errorNotice( translate( 'Upload problem: %(error)s.', {
			args: { error: error.error }
		} ) ) );
		return;
	}
	dispatch( errorNotice( translate( 'Problem uploading the plugin.' ) ) );
};

export const receiveError = ( { dispatch }, { siteId }, error ) => {
	dispatch( recordTracksEvent( 'calypso_automated_transfer_inititate_failure', {
		context: 'plugin_upload',
		error: error.error,
	} ) );
	showErrorNotice( dispatch, error );
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
