import { getTheme } from 'calypso/state/themes/selectors/get-theme';
import type { AppState } from 'calypso/types';

import 'calypso/state/themes/init';

export function isFullSiteEditingTheme(
	state: AppState,
	themeId: string | null | undefined,
	siteId: number | null | undefined
): boolean {
	if ( ! themeId ) {
		return false;
	}
	const theme =
		getTheme( state, 'wpcom', themeId ) ||
		getTheme( state, 'wporg', themeId ) ||
		( siteId && getTheme( state, siteId, themeId ) );
	if ( ! theme ) {
		return false;
	}

	return !! theme.block_theme;
}
