/**
 * Internal dependencies
 */
import 'calypso/state/themes/init';

/**
 * Returns the ThemePreview state
 *
 * @param  {object}  state Global state tree
 * @returns {?string}  ThemePreview state
 */
export function themePreviewVisibility( state ) {
	return state.themes.themePreviewVisibility;
}
