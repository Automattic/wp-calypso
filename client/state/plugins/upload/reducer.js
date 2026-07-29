import {
	AUTOMATED_TRANSFER_INITIATE_WITH_PLUGIN_ZIP,
	AUTOMATED_TRANSFER_STATUS_SET,
	PLUGIN_UPLOAD,
	PLUGIN_UPLOAD_CLEAR,
	PLUGIN_UPLOAD_COMPLETE,
	PLUGIN_UPLOAD_ERROR,
	PLUGIN_UPLOAD_PROGRESS,
} from 'calypso/state/action-types';
import { isTransferRunning } from 'calypso/state/automated-transfer/constants';
import { combineReducers, keyedReducer } from 'calypso/state/utils';

export const uploadedPluginId = keyedReducer( 'siteId', ( state = {}, action ) => {
	switch ( action.type ) {
		case PLUGIN_UPLOAD:
		// A transfer reports the slug it read off the archive, so the previous upload's slug has to go
		// with the upload that produced it — otherwise the new one is watched under the old name.
		case AUTOMATED_TRANSFER_INITIATE_WITH_PLUGIN_ZIP:
			return null;
		case PLUGIN_UPLOAD_COMPLETE: {
			const { pluginId } = action;
			return pluginId;
		}
		case PLUGIN_UPLOAD_CLEAR:
			return null;
		case PLUGIN_UPLOAD_ERROR:
			return null;
		case AUTOMATED_TRANSFER_STATUS_SET: {
			const { uploadedPluginId: pluginId } = action;
			return pluginId;
		}
	}

	return state;
} );

// How the attempt on screen was started. Which of the two upload paths a flow is on decides who
// installs and activates its plugin, and that cannot be read back from the site's transfer status:
// that is shared, persisted, and may describe a transfer from another session entirely.
export const uploadMethod = keyedReducer( 'siteId', ( state = null, action ) => {
	switch ( action.type ) {
		case PLUGIN_UPLOAD:
			return 'direct';
		case AUTOMATED_TRANSFER_INITIATE_WITH_PLUGIN_ZIP:
			return 'transfer';
		case PLUGIN_UPLOAD_CLEAR:
			return null;
	}

	return state;
} );

export const uploadError = keyedReducer( 'siteId', ( state = {}, action ) => {
	switch ( action.type ) {
		case PLUGIN_UPLOAD_ERROR: {
			const { error } = action;
			return error;
		}
		case PLUGIN_UPLOAD:
		// A new attempt starts clean, whichever way it uploads. The page that would otherwise clear
		// this skips doing so while an upload looks like it is still running.
		case AUTOMATED_TRANSFER_INITIATE_WITH_PLUGIN_ZIP:
			return null;
		case PLUGIN_UPLOAD_CLEAR:
			return null;
		case PLUGIN_UPLOAD_COMPLETE:
			return null;
	}

	return state;
} );

export const progressPercent = keyedReducer( 'siteId', ( state = {}, action ) => {
	switch ( action.type ) {
		case PLUGIN_UPLOAD_PROGRESS: {
			const { progress } = action;
			return progress;
		}
		case PLUGIN_UPLOAD:
		case AUTOMATED_TRANSFER_INITIATE_WITH_PLUGIN_ZIP:
			return 0;
		case PLUGIN_UPLOAD_CLEAR:
			return 0;
		case PLUGIN_UPLOAD_ERROR:
			return 0;
	}

	return state;
} );

export const inProgress = keyedReducer( 'siteId', ( state = {}, action ) => {
	switch ( action.type ) {
		case PLUGIN_UPLOAD:
			return true;
		case PLUGIN_UPLOAD_COMPLETE:
			return false;
		case PLUGIN_UPLOAD_ERROR:
			return false;
		case PLUGIN_UPLOAD_CLEAR:
			return false;
		case AUTOMATED_TRANSFER_INITIATE_WITH_PLUGIN_ZIP:
			return true;
		case AUTOMATED_TRANSFER_STATUS_SET: {
			const { status } = action;
			// Every state a transfer settles in ends the upload, not just the two that end it well: a
			// transfer that errors would otherwise leave the page believing an upload is still running,
			// with its drop zone hidden and no way to try again.
			return isTransferRunning( status );
		}
	}

	return state;
} );

export default combineReducers( {
	uploadedPluginId,
	uploadMethod,
	uploadError,
	progressPercent,
	inProgress,
} );
