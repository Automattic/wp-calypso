/**
 * Internal dependencies
 */
import {
	FIRST_VIEW_ENABLE,
	FIRST_VIEW_DISABLE,
	FIRST_VIEW_HIDE,
	FIRST_VIEW_SHOW,
} from 'state/action-types';

export function disableView( { view } ) {
	return {
		type: FIRST_VIEW_DISABLE,
		view,
	};
}

export function enableView( { view } ) {
	return {
		type: FIRST_VIEW_ENABLE,
		view,
	};
}

export function hideView( { view, enabled } ) {
	return {
		type: FIRST_VIEW_HIDE,
		view,
		enabled,
	};
}

export function showView( { view } ) {
	return {
		type: FIRST_VIEW_SHOW,
		view,
	};
}
