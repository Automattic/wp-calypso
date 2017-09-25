/**
 * Internal dependencies
 */
import { POST_TYPE_LIST_SHARE_PANEL_HIDE, POST_TYPE_LIST_SHARE_PANEL_TOGGLE } from 'state/action-types';

export function hideSharePanel( postGlobalId ) {
	return {
		type: POST_TYPE_LIST_SHARE_PANEL_HIDE,
		postGlobalId,
	};
}

export function toggleSharePanel( postGlobalId ) {
	return {
		type: POST_TYPE_LIST_SHARE_PANEL_TOGGLE,
		postGlobalId,
	};
}
