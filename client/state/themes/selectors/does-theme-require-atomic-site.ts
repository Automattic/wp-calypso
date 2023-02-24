import { isExternallyManagedTheme } from './is-externally-managed-theme';
import 'calypso/state/themes/init';
import type { AppState } from 'calypso/types';

/**
 * Checks if a theme requires an Atomic site.
 *
 * @param {AppState} state   The app global state
 * @param {string}   themeId The theme ID
 * @returns {boolean} True if the theme requires an Atomic site
 */
export function doesThemeRequireAtomicSite( state: AppState, themeId: string ): boolean {
	return isExternallyManagedTheme( state, themeId );
}
