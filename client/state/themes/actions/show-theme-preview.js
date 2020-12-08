/**
 * Internal dependencies
 */
import { THEME_PREVIEW_STATE } from 'calypso/state/themes/action-types';

import 'calypso/state/themes/init';

export function showThemePreview( themeId ) {
	return {
		type: THEME_PREVIEW_STATE,
		themeId,
	};
}
