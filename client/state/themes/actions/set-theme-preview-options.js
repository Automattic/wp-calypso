/**
 * Internal dependencies
 */
import { THEME_PREVIEW_OPTIONS } from 'calypso/state/themes/action-types';

import 'calypso/state/themes/init';

export function setThemePreviewOptions( primary, secondary ) {
	return {
		type: THEME_PREVIEW_OPTIONS,
		primary,
		secondary,
	};
}
