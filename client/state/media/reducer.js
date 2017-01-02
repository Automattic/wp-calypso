/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { reject, keyBy, map } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer, keyedReducer } from 'state/utils';
import {
	MEDIA_ITEMS_RECEIVE,
	MEDIA_FILE_UPLOAD,
	MEDIA_FILE_UPLOAD_FAILURE,
	MEDIA_FILE_UPLOAD_SUCCESS,
	MEDIA_FILE_UPLOADS_ENQUEUE
} from 'state/action-types';
import { createTransientMedia } from './utils';

/**
 * Returns the updated upload queue state after an action has been dispatched.
 * The state is an array of pairs: siteId, file.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const uploadQueue = createReducer( [], {
	[ MEDIA_FILE_UPLOADS_ENQUEUE ]: ( state, { siteId, files } ) => [
		...state,
		...files.map( ( file ) => [ siteId, file ] )
	],
	[ MEDIA_FILE_UPLOAD_FAILURE ]: ( state, { file } ) => reject( state, ( [ , queued ] ) => queued === file ),
	[ MEDIA_FILE_UPLOAD_SUCCESS ]: ( state, { file } ) => reject( state, ( [ , queued ] ) => queued === file )
} );

/**
 * Returns the updated upload queue state after an action has been dispatched.
 * The state a mapping of site ID to media keyed by ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const items = keyedReducer( 'siteId', createReducer( {}, {
	[ MEDIA_ITEMS_RECEIVE ]: ( state, action ) => {
		return {
			...state,
			...keyBy( action.items, 'ID' )
		};
	},
	[ MEDIA_FILE_UPLOAD ]: ( state, action ) => {
		const transientMedia = createTransientMedia( action.file );
		return {
			...state,
			[ transientMedia.ID ]: transientMedia
		};
	},
	[ MEDIA_FILE_UPLOADS_ENQUEUE ]: ( state, action ) => {
		return {
			...state,
			...keyBy( map( action.files, createTransientMedia ), 'ID' )
		};
	}
} ) );

export default combineReducers( {
	uploadQueue,
	items
} );
