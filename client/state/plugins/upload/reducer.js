/**
 * Internal dependencies
 */

import { combineReducers, keyedReducer, withoutPersistence } from 'calypso/state/utils';

import {
	AUTOMATED_TRANSFER_INITIATE_WITH_PLUGIN_ZIP,
	AUTOMATED_TRANSFER_STATUS_SET,
	PLUGIN_UPLOAD,
	PLUGIN_UPLOAD_CLEAR,
	PLUGIN_UPLOAD_COMPLETE,
	PLUGIN_UPLOAD_ERROR,
	PLUGIN_UPLOAD_PROGRESS,
} from 'calypso/state/action-types';

export const uploadedPluginId = keyedReducer(
	'siteId',
	withoutPersistence( ( state = {}, action ) => {
		switch ( action.type ) {
			case PLUGIN_UPLOAD:
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
	} )
);

export const uploadError = keyedReducer(
	'siteId',
	withoutPersistence( ( state = {}, action ) => {
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
	} )
);

export const progressPercent = keyedReducer(
	'siteId',
	withoutPersistence( ( state = {}, action ) => {
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
	} )
);

export const inProgress = keyedReducer(
	'siteId',
	withoutPersistence( ( state = {}, action ) => {
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
				return status !== 'complete';
			}
		}

		return state;
	} )
);

export default combineReducers( {
	uploadedPluginId,
	uploadError,
	progressPercent,
	inProgress,
} );
