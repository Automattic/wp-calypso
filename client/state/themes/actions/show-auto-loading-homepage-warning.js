/**
 * Internal dependencies
 */
import { THEME_SHOW_AUTO_LOADING_HOMEPAGE_WARNING } from 'state/action-types';

import 'state/themes/init';

export function showAutoLoadingHomepageWarning( themeId ) {
	return {
		type: THEME_SHOW_AUTO_LOADING_HOMEPAGE_WARNING,
		themeId,
	};
}
