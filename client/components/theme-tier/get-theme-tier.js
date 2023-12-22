import config from '@automattic/calypso-config';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getTheme } from 'calypso/state/themes/selectors';

export default ( state, siteId, themeId ) => {
	const theme = getTheme( state, 'wpcom', themeId );
	const themeTier = theme?.theme_tier || {};
	const isThemeAllowedOnSite =
		config.isEnabled( 'themes/tiers' ) && themeTier?.feature
			? siteHasFeature( state, siteId, themeTier.feature )
			: true;

	return {
		themeTier,
		isThemeAllowedOnSite: isThemeAllowedOnSite || theme.retained_benefits?.is_eligible,
	};
};
