import config from '@automattic/calypso-config';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getTheme } from 'calypso/state/themes/selectors';

export default ( state, siteId, themeId ) => {
	const theme = getTheme( state, siteId ?? 'wpcom', themeId );
	const themeTier = theme?.theme_tier || {};
	const isThemeAllowedOnSite =
		config.isEnabled( 'themes/tiers' ) && themeTier?.feature
			? siteHasFeature( state, siteId, themeTier.feature )
			: true;

	const themeHasRetainedBenefits =
		! isThemeAllowedOnSite &&
		theme.retained_benefits?.is_eligible &&
		siteHasFeature( state, siteId, theme.retained_benefits.tier.feature );

	return {
		themeTier: themeHasRetainedBenefits ? theme.retained_benefits.tier : themeTier,
		isThemeAllowedOnSite: isThemeAllowedOnSite || themeHasRetainedBenefits,
	};
};
