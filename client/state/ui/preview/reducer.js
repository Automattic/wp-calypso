/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	PREVIEW_URL_CLEAR,
	PREVIEW_URL_SET,
	PREVIEW_TOOL_SET,
	PREVIEW_TYPE_SET,
	PREVIEW_TYPE_RESET,
} from 'state/action-types';

export function currentPreviewUrl( state = null, action ) {
	switch ( action.type ) {
		case PREVIEW_URL_SET:
			return action.url;
		case PREVIEW_URL_CLEAR:
			return null;
	}
	return state;
}

const defaultPreviewType = 'site-preview';
export function currentPreviewType( state = defaultPreviewType, action ) {
	switch ( action.type ) {
		case PREVIEW_TYPE_SET:
			return action.previewType;
		case PREVIEW_TYPE_RESET:
			return defaultPreviewType;
	}
	return state;
}

export function activeDesignTool( state = null, action ) {
	switch ( action.type ) {
		case PREVIEW_TOOL_SET:
			return action.id;
	}
	return state;
}

export default combineReducers( {
	currentPreviewUrl,
	currentPreviewType,
	activeDesignTool,
} );
