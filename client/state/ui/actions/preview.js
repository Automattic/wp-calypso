/**
 * Internal dependencies
 */
import { PREVIEW_IS_SHOWING } from 'calypso/state/action-types';

import 'calypso/state/ui/init';

export function setPreviewShowing( isShowing ) {
	return {
		type: PREVIEW_IS_SHOWING,
		isShowing,
	};
}
