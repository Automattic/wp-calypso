/**
 * Internal dependencies
 */
import { PREVIEW_IS_SHOWING } from 'state/action-types';

export function setPreviewShowing( isShowing ) {
	return {
		type: PREVIEW_IS_SHOWING,
		isShowing,
	};
}
