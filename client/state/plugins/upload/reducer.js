/**
 * Internal dependencies
 */
import { AUTOMATED_TRANSFER_INITIATE_WITH_PLUGIN_ZIP, AUTOMATED_TRANSFER_STATUS_SET, PLUGIN_UPLOAD, PLUGIN_UPLOAD_CLEAR, PLUGIN_UPLOAD_COMPLETE, PLUGIN_UPLOAD_ERROR, PLUGIN_UPLOAD_PROGRESS } from 'state/action-types';
import { combineReducers, createReducer, keyedReducer } from 'state/utils';

export const uploadedPluginId = keyedReducer( 'siteId', createReducer( {}, {
	[ PLUGIN_UPLOAD ]: () => null,
	[ PLUGIN_UPLOAD_COMPLETE ]: ( state, { pluginId } ) => pluginId,
	[ PLUGIN_UPLOAD_CLEAR ]: () => null,
	[ PLUGIN_UPLOAD_ERROR ]: () => null,
	[ AUTOMATED_TRANSFER_STATUS_SET ]: ( state, { uploadedPluginId: pluginId } ) => pluginId,
} ) );

export const uploadError = keyedReducer( 'siteId', createReducer( {}, {
	[ PLUGIN_UPLOAD_ERROR ]: ( state, { error } ) => error,
	[ PLUGIN_UPLOAD ]: () => null,
	[ PLUGIN_UPLOAD_CLEAR ]: () => null,
	[ PLUGIN_UPLOAD_COMPLETE ]: () => null,
} ) );

export const progressPercent = keyedReducer( 'siteId', createReducer( {}, {
	[ PLUGIN_UPLOAD_PROGRESS ]: ( state, { progress } ) => progress,
	[ PLUGIN_UPLOAD ]: () => 0,
	[ PLUGIN_UPLOAD_CLEAR ]: () => 0,
	[ PLUGIN_UPLOAD_ERROR ]: () => 0,
} ) );

export const inProgress = keyedReducer( 'siteId', createReducer( {}, {
	[ PLUGIN_UPLOAD ]: () => true,
	[ PLUGIN_UPLOAD_COMPLETE ]: () => false,
	[ PLUGIN_UPLOAD_ERROR ]: () => false,
	[ PLUGIN_UPLOAD_CLEAR ]: () => false,
	[ AUTOMATED_TRANSFER_INITIATE_WITH_PLUGIN_ZIP ]: () => true,
	[ AUTOMATED_TRANSFER_STATUS_SET ]: ( state, { status } ) => status !== 'complete',
} ) );

export default combineReducers( {
	uploadedPluginId,
	uploadError,
	progressPercent,
	inProgress,
} );
