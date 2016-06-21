/**
 * Internal dependencies
 */
import {
	FIRST_VIEW_HIDE
} from 'state/action-types';

export function hideView( { view, enabled } ) {
	return {
		type: FIRST_VIEW_HIDE,
		view,
		enabled,
	};
}
