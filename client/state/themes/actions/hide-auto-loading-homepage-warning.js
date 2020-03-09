/**
 * Internal dependencies
 */
import { THEME_HIDE_AUTO_LOADING_HOMEPAGE_WARNING } from 'state/action-types';

import 'state/themes/init';

export function hideAutoLoadingHomepageWarning() {
	return {
		type: THEME_HIDE_AUTO_LOADING_HOMEPAGE_WARNING,
	};
}
