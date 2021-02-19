/**
 * Internal dependencies
 */
import { THEMES_SHOWCASE_OPEN, THEMES_BOOKMARK_SET } from 'calypso/state/themes/action-types';

import 'calypso/state/themes/init';

// Open "More Themes" search area.
export function openThemesShowcase() {
	return {
		type: THEMES_SHOWCASE_OPEN,
	};
}

export function setThemesBookmark( state ) {
	return {
		type: THEMES_BOOKMARK_SET,
		payload: state,
	};
}
