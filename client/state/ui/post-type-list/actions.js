/**
 * Internal dependencies
 */
import {
	POST_TYPE_LIST_SHARE_PANEL_HIDE,
	POST_TYPE_LIST_SHARE_PANEL_TOGGLE,
} from 'calypso/state/action-types';

export function hideActiveSharePanel() {
	return {
		type: POST_TYPE_LIST_SHARE_PANEL_HIDE,
	};
}

export function toggleSharePanel( postGlobalId ) {
	return {
		type: POST_TYPE_LIST_SHARE_PANEL_TOGGLE,
		postGlobalId,
	};
}
