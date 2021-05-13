/**
 * Internal dependencies
 */
import { THEME_ACCEPT_AUTO_LOADING_HOMEPAGE_WARNING } from 'calypso/state/themes/action-types';

import 'calypso/state/themes/init';

export function acceptAutoLoadingHomepageWarning( themeId ) {
	return {
		type: THEME_ACCEPT_AUTO_LOADING_HOMEPAGE_WARNING,
		themeId,
	};
}
