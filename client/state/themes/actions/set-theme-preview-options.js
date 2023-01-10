import { THEME_PREVIEW_OPTIONS } from 'calypso/state/themes/action-types';

import 'calypso/state/themes/init';

export function setThemePreviewOptions( themeId, primary, secondary, styleVariation ) {
	return {
		type: THEME_PREVIEW_OPTIONS,
		themeId,
		primary,
		secondary,
		styleVariation,
	};
}
