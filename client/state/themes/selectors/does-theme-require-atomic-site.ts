import { isExternallyManagedTheme } from './is-externally-managed-theme';
import 'calypso/state/themes/init';

/**
 * Checks if a theme requires an Atomic site.
 *
 * @param state The app global state
 * @param themeId The theme ID
 * @returns True if the theme requires an Atomic site
 */
export function doesThemeRequireAtomicSite( state = {}, themeId: string ): boolean {
	return isExternallyManagedTheme( state, themeId );
}
