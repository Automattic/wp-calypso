import { getTheme } from 'calypso/state/themes/selectors/get-theme';
import { getThemeTaxonomySlugs } from 'calypso/state/themes/utils';
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

	const themeFeatures = getThemeTaxonomySlugs( theme, 'theme_feature' );

	return themeFeatures.includes( 'full-site-editing' );
}
