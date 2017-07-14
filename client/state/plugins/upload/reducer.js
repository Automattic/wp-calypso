/**
 * Internal dependencies
 */
import {
	combineReducers,
	createReducer,
	keyedReducer,
} from 'state/utils';

import {
	PLUGIN_UPLOAD,
	PLUGIN_UPLOAD_CLEAR,
	PLUGIN_UPLOAD_COMPLETE,
	PLUGIN_UPLOAD_ERROR,
	PLUGIN_UPLOAD_PROGRESS,
} from 'state/action-types';

const uploadedPluginId = keyedReducer( 'siteId', createReducer( {}, {
	[ PLUGIN_UPLOAD ]: () => null,
	[ PLUGIN_UPLOAD_COMPLETE ]: ( state, { pluginId } ) => pluginId,
	[ PLUGIN_UPLOAD_CLEAR ]: () => null,
} ) );

const uploadError = keyedReducer( 'siteId', createReducer( {}, {
	[ PLUGIN_UPLOAD_ERROR ]: ( state, { error } ) => error,
	[ PLUGIN_UPLOAD ]: () => null,
	[ PLUGIN_UPLOAD_CLEAR ]: () => null,
} ) );

const progressLoaded = keyedReducer( 'siteId', createReducer( {}, {
	[ PLUGIN_UPLOAD_PROGRESS ]: ( state, { loaded } ) => loaded,
	[ PLUGIN_UPLOAD ]: () => null,
	[ PLUGIN_UPLOAD_CLEAR ]: () => null,
} ) );

const progressTotal = keyedReducer( 'siteId', createReducer( {}, {
	[ PLUGIN_UPLOAD_PROGRESS ]: ( state, { total } ) => total,
	[ PLUGIN_UPLOAD ]: () => null,
	[ PLUGIN_UPLOAD_CLEAR ]: () => null,
} ) );

const inProgress = keyedReducer( 'siteId', createReducer( {}, {
	[ PLUGIN_UPLOAD ]: () => true,
	[ PLUGIN_UPLOAD_COMPLETE ]: () => false,
	[ PLUGIN_UPLOAD_ERROR ]: () => false,
	[ PLUGIN_UPLOAD_CLEAR ]: () => null,
} ) );

export default combineReducers( {
	uploadedPluginId,
	uploadError,
	progressLoaded,
	progressTotal,
	inProgress,
} );
