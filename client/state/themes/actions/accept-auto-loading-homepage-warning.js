/**
 * Internal dependencies
 */
import { THEME_ACCEPT_AUTO_LOADING_HOMEPAGE_WARNING } from 'state/themes/action-types';

import 'state/themes/init';

export function acceptAutoLoadingHomepageWarning( themeId ) {
	return {
		type: THEME_ACCEPT_AUTO_LOADING_HOMEPAGE_WARNING,
		themeId,
	};
}
