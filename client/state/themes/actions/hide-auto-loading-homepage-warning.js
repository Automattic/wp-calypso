/**
 * Internal dependencies
 */
import { THEME_HIDE_AUTO_LOADING_HOMEPAGE_WARNING } from 'calypso/state/themes/action-types';

import 'calypso/state/themes/init';

export function hideAutoLoadingHomepageWarning() {
	return {
		type: THEME_HIDE_AUTO_LOADING_HOMEPAGE_WARNING,
	};
}
