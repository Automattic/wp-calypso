/**
 * Internal dependencies
 */
import { THEME_PREVIEW_STATE } from 'state/themes/action-types';

import 'state/themes/init';

export function showThemePreview( themeId ) {
	return {
		type: THEME_PREVIEW_STATE,
		themeId,
	};
}
