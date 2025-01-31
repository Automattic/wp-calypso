import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getThemeTierForTheme } from 'calypso/state/themes/selectors/get-theme-tier-for-theme';
import { IAppState } from 'calypso/state/types';

export function isThemeAllowedOnSite( state: IAppState, siteId: number | null, themeId: string ) {
	const themeTier = getThemeTierForTheme( state, themeId );
	const features = themeTier?.featureList ?? [ themeTier?.feature ];

	return features.some(
		( feature: string | null | undefined ) => ! feature || siteHasFeature( state, siteId, feature )
	);
}
