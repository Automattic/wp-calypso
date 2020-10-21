/**
 * Internal dependencies
 */

import {
	LAYOUT_FOCUS_SET,
	LAYOUT_NEXT_FOCUS_SET,
	LAYOUT_NEXT_FOCUS_ACTIVATE,
} from 'calypso/state/action-types';

export function setLayoutFocus( area ) {
	return {
		type: LAYOUT_FOCUS_SET,
		area,
	};
}

export function setNextLayoutFocus( area ) {
	return {
		type: LAYOUT_NEXT_FOCUS_SET,
		area,
	};
}

export function activateNextLayoutFocus() {
	return {
		type: LAYOUT_NEXT_FOCUS_ACTIVATE,
	};
}
