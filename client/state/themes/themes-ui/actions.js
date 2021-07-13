/**
 * Internal dependencies
 */
import { THEMES_BOOKMARK_SET } from 'calypso/state/themes/action-types';

import 'calypso/state/themes/init';

export function setThemesBookmark( state ) {
	return {
		type: THEMES_BOOKMARK_SET,
		payload: state,
	};
}
