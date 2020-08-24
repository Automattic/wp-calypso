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
import { fetchAutomatedTransferStatus } from 'state/automated-transfer/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

/*
 * Currently this module is only used for initiating transfers
 * with a plugin zip file. For initiating with a plugin ID
 * or theme zip, see state/themes/actions#initiateThemeTransfer.
 */

export const initiateTransferWithPluginZip = ( action ) => {
	const { siteId, pluginZip } = action;

	return [
		recordTracksEvent( 'calypso_automated_transfer_inititate_transfer', {
			context: 'plugin_upload',
		} ),
		http(
			{
				method: 'POST',
				path: `/sites/${ siteId }/automated-transfers/initiate`,
				apiVersion: '1',
				formData: [ [ 'plugin_zip', pluginZip ] ],
			},
			action
		),
	];
};

const showErrorNotice = ( error ) => {
	if ( error.error === 'invalid_input' ) {
		return errorNotice( translate( 'The uploaded file is not a valid zip.' ) );
	}

	if ( error.error === 'api_success_false' ) {
		return errorNotice( translate( 'The uploaded file is not a valid plugin.' ) );
	}

	if ( error.error ) {
		return errorNotice(
			translate( 'Upload problem: %(error)s.', {
				args: { error: error.error },
			} )
		);
	}
	return errorNotice( translate( 'Problem uploading the plugin.' ) );
};

export const receiveError = ( { siteId }, error ) => {
	return [
		recordTracksEvent( 'calypso_automated_transfer_inititate_failure', {
			context: 'plugin_upload',
			error: error.error,
		} ),
		showErrorNotice( error ),
		pluginUploadError( siteId, error ),
	];
};

export const receiveResponse = ( action, { success } ) => {
	if ( success === false ) {
		return receiveError( action, { error: 'api_success_false' } );
	}

	return [
		recordTracksEvent( 'calypso_automated_transfer_inititate_success', {
			context: 'plugin_upload',
		} ),
		fetchAutomatedTransferStatus( action.siteId ),
	];
};

export const updateUploadProgress = ( { siteId }, { loaded, total } ) => {
	const progress = total ? ( loaded / total ) * 100 : 0;
	return updatePluginUploadProgress( siteId, progress );
};

registerHandlers( 'state/data-layer/wpcom/sites/automated-transfer/initiate/index.js', {
	[ AUTOMATED_TRANSFER_INITIATE_WITH_PLUGIN_ZIP ]: [
		dispatchRequest( {
			fetch: initiateTransferWithPluginZip,
			onSuccess: receiveResponse,
			onError: receiveError,
			onProgress: updateUploadProgress,
		} ),
	],
} );
