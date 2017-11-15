/** @format */

/**
 * Internal dependencies
 */

import {
	POST_TYPE_LIST_MULTI_SELECTION_MODE_TOGGLE,
	POST_TYPE_LIST_SELECTION_TOGGLE,
	POST_TYPE_LIST_SHARE_PANEL_HIDE,
	POST_TYPE_LIST_SHARE_PANEL_TOGGLE,
} from 'state/action-types';

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

export function toggleMultiSelect() {
	return {
		type: POST_TYPE_LIST_MULTI_SELECTION_MODE_TOGGLE,
	};
}

export function togglePostSelection( postGlobalId ) {
	return {
		type: POST_TYPE_LIST_SELECTION_TOGGLE,
		postGlobalId,
	};
}
