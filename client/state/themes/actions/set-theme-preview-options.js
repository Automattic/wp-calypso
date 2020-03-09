/**
 * Internal dependencies
 */
import { THEME_PREVIEW_OPTIONS } from 'state/action-types';

import 'state/themes/init';

export function setThemePreviewOptions( primary, secondary ) {
	return {
		type: THEME_PREVIEW_OPTIONS,
		primary,
		secondary,
	};
}
