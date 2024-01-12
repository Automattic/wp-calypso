import config from '@automattic/calypso-config';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getThemeTierForTheme } from 'calypso/state/themes/selectors/get-theme-tier-for-theme';
import { AppState } from 'calypso/types';

export function isThemeAllowedOnSite( state: AppState, siteId: number, themeId: string ) {
	const themeTier = getThemeTierForTheme( state, themeId );
	return config.isEnabled( 'themes/tiers' ) && themeTier?.feature
		? siteHasFeature( state, siteId, themeTier.feature )
		: true;
}
