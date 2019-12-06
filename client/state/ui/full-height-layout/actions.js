/**
 * Internal dependencies
 */
import { FULL_HEIGHT_LAYOUT_ON, FULL_HEIGHT_LAYOUT_OFF } from 'state/action-types';

export function setFullHeightLayout() {
	return dispatch =>
		dispatch( {
			type: FULL_HEIGHT_LAYOUT_ON,
		} );
}

export function unsetFullHeightLayout() {
	return {
		type: FULL_HEIGHT_LAYOUT_OFF,
	};
}
