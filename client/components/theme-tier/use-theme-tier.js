import { useSelector } from 'calypso/state';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getTheme } from 'calypso/state/themes/selectors/get-theme';

export default function useThemeTier( siteId, themeId ) {
	const theme = useSelector( ( state ) => getTheme( state, 'wpcom', themeId ) );
	const themeTier = theme?.theme_tier || {};
	const isThemeAllowedOnSite = useSelector( ( state ) =>
		themeTier?.feature ? siteHasFeature( state, siteId, themeTier.feature ) : true
	);

	return {
		themeTier,
		isThemeAllowedOnSite,
	};
}
