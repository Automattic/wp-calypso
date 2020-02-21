/**
 * Internal dependencies
 */
import 'state/themes/init';

const emptyObject = {};

export function getThemePreviewThemeOptions( state ) {
	return state.themes.themePreviewOptions ?? emptyObject;
}
