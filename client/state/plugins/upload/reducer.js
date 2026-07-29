import {
	AUTOMATED_TRANSFER_INITIATE_WITH_PLUGIN_ZIP,
	AUTOMATED_TRANSFER_STATUS_SET,
	PLUGIN_UPLOAD,
	PLUGIN_UPLOAD_CLEAR,
	PLUGIN_UPLOAD_COMPLETE,
	PLUGIN_UPLOAD_ERROR,
	PLUGIN_UPLOAD_PROGRESS,
} from 'calypso/state/action-types';
import { combineReducers, keyedReducer } from 'calypso/state/utils';

// How the attempt on screen was started, which decides who installs and activates its plugin. The
// site's transfer status cannot answer that: it is shared, persisted, and may describe another.
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

export const uploadedPluginId = keyedReducer( 'siteId', ( state = {}, action ) => {
	switch ( action.type ) {
		case PLUGIN_UPLOAD:
		// A transfer reports the slug it read off the archive, so the last upload's slug has to go with
		// it — otherwise the new one is watched for, and confirmed, under the old name.
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

export const uploadError = keyedReducer( 'siteId', ( state = {}, action ) => {
	switch ( action.type ) {
		case PLUGIN_UPLOAD_ERROR: {
			const { error } = action;
			return error;
		}
		case PLUGIN_UPLOAD:
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
			return status !== 'complete' && status !== 'reverted';
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
