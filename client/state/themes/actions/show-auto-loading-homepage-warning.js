/**
 * Internal dependencies
 */
import { THEME_SHOW_AUTO_LOADING_HOMEPAGE_WARNING } from 'calypso/state/themes/action-types';

import 'calypso/state/themes/init';

export function showAutoLoadingHomepageWarning( themeId ) {
	return {
		type: THEME_SHOW_AUTO_LOADING_HOMEPAGE_WARNING,
		themeId,
	};
}
