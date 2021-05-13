/**
 * Internal dependencies
 */
import { THEME_BACK_PATH_SET } from 'calypso/state/themes/action-types';

import 'calypso/state/themes/init';

// Set destination for 'back' button on theme sheet
export function setBackPath( path ) {
	return {
		type: THEME_BACK_PATH_SET,
		path,
	};
}
