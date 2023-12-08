import { useSelector } from 'calypso/state';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getTheme } from 'calypso/state/themes/selectors/get-theme';
import { getThemeTier } from 'calypso/state/themes/selectors/get-theme-tier';

export default function useThemeTier( siteId, themeSlug ) {
	const theme = useSelector( ( state ) => getTheme( state, 'wpcom', themeSlug ) );
	const tier = useSelector( ( state ) => getThemeTier( state, theme?.theme_tier ) );
	const isThemeAllowedOnSite = useSelector( ( state ) =>
		tier?.feature ? siteHasFeature( state, siteId, tier.feature ) : true
	);

	const themeTier = Object.keys( tier ).length
		? {
				...tier,
				slug: theme?.theme_tier,
		  }
		: {};

	return {
		themeTier,
		isThemeAllowedOnSite,
	};
}
