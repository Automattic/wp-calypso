import type { AppState } from 'calypso/types';

import 'calypso/state/themes/init';

export function isThemeActivationSyncStarted(
	state: AppState,
	siteId: number,
	themeId: string
): boolean {
	return state.themes.startActivationSync[ siteId ]?.[ themeId ] ?? false;
}
