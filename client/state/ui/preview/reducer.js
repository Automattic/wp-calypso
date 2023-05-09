import { PREVIEW_URL_CLEAR, PREVIEW_URL_SET } from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';

export function currentPreviewSiteId( state = null, action ) {
	switch ( action.type ) {
		case PREVIEW_URL_SET:
			return action.siteId ?? null;
	}
	return state;
}

export function currentPreviewUrl( state = null, action ) {
	switch ( action.type ) {
		case PREVIEW_URL_SET:
			return action.url;
		case PREVIEW_URL_CLEAR:
			return null;
	}
	return state;
}

export default combineReducers( {
	currentPreviewSiteId,
	currentPreviewUrl,
} );
