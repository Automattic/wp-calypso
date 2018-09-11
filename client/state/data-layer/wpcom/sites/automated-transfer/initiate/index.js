/** @format */

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

export const initiateTransferWithPluginZip = ( { dispatch }, action ) => {
	const { siteId, pluginZip } = action;

	dispatch(
		recordTracksEvent( 'calypso_automated_transfer_inititate_transfer', {
			context: 'plugin_upload',
		} )
	);

	dispatch(
		http(
			{
				method: 'POST',
				path: `/sites/${ siteId }/automated-transfers/initiate`,
				apiVersion: '1',
				formData: [ [ 'plugin_zip', pluginZip ] ],
			},
			action
		)
	);
};

const showErrorNotice = ( dispatch, error ) => {
	if ( error.error === 'invalid_input' ) {
		dispatch( errorNotice( translate( 'The uploaded file is not a valid zip.' ) ) );
		return;
	}

	if ( error.error === 'api_success_false' ) {
		dispatch( errorNotice( translate( 'The uploaded file is not a valid plugin.' ) ) );
		return;
	}

	if ( error.error ) {
		dispatch(
			errorNotice(
				translate( 'Upload problem: %(error)s.', {
					args: { error: error.error },
				} )
			)
		);
		return;
	}
	dispatch( errorNotice( translate( 'Problem uploading the plugin.' ) ) );
};

export const receiveError = ( { dispatch }, { siteId }, error ) => {
	dispatch(
		recordTracksEvent( 'calypso_automated_transfer_inititate_failure', {
			context: 'plugin_upload',
			error: error.error,
		} )
	);
	showErrorNotice( dispatch, error );
	dispatch( pluginUploadError( siteId, error ) );
};

export const receiveResponse = ( { dispatch }, { siteId }, { success } ) => {
	if ( success === false ) {
		receiveError( { dispatch }, { siteId }, { error: 'api_success_false' } );
		return;
	}

	dispatch(
		recordTracksEvent( 'calypso_automated_transfer_inititate_success', {
			context: 'plugin_upload',
		} )
	);
	dispatch( fetchAutomatedTransferStatus( siteId ) );
};

export const updateUploadProgress = ( { dispatch }, { siteId }, { loaded, total } ) => {
	const progress = total ? ( loaded / total ) * 100 : 0;
	dispatch( updatePluginUploadProgress( siteId, progress ) );
};

registerHandlers( 'state/data-layer/wpcom/sites/automated-transfer/initiate/index.js', {
	[ AUTOMATED_TRANSFER_INITIATE_WITH_PLUGIN_ZIP ]: [
		dispatchRequest( initiateTransferWithPluginZip, receiveResponse, receiveError, {
			onProgress: updateUploadProgress,
		} ),
	],
} );
