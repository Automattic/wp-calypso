/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	IMAGE_EDITOR_ROTATE_COUNTERCLOCKWISE,
	IMAGE_EDITOR_FLIP,
	IMAGE_EDITOR_SET_FILE_INFO,
	IMAGE_EDITOR_STATE_RESET
} from 'state/action-types';

export const defaultTransform = {
	degrees: 0,
	scaleX: 1,
	scaleY: 1
};

export const defaultFileInfo = {
	src: '',
	fileName: 'default',
	mimeType: 'image/png'
};

export function hasChanges( state = false, action ) {
	switch ( action.type ) {
		case IMAGE_EDITOR_ROTATE_COUNTERCLOCKWISE:
		case IMAGE_EDITOR_FLIP:
		case IMAGE_EDITOR_STATE_RESET:
			return action.type !== IMAGE_EDITOR_STATE_RESET;
	}

	return state;
}

export function fileInfo( state = defaultFileInfo, action ) {
	switch ( action.type ) {
		case IMAGE_EDITOR_SET_FILE_INFO:
			return Object.assign( {}, state, { src: action.src, fileName: action.fileName, mimeType: action.mimeType } );
	}

	return state;
}

export function transform( state = defaultTransform, action ) {
	switch ( action.type ) {
		case IMAGE_EDITOR_ROTATE_COUNTERCLOCKWISE:
			return Object.assign( {}, state, { degrees: ( state.degrees - 90 ) % 360 } );
		case IMAGE_EDITOR_FLIP:
			return Object.assign( {}, state, { scaleX: -state.scaleX } );
		case IMAGE_EDITOR_STATE_RESET:
			return Object.assign( {}, state, { degrees: 0, scaleX: 1, scaleY: 1 } );
	}

	return state;
}

export default combineReducers( {
	hasChanges,
	fileInfo,
	transform
} );
