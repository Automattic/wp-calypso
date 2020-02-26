/**
 * Internal dependencies
 */
import { THEME_BACK_PATH_SET } from 'state/action-types';

import 'state/themes/init';

// Set destination for 'back' button on theme sheet
export function setBackPath( path ) {
	return {
		type: THEME_BACK_PATH_SET,
		path,
	};
}
