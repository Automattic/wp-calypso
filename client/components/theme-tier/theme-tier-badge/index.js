import { BUNDLED_THEME, DOT_ORG_THEME, MARKETPLACE_THEME } from '@automattic/design-picker';
import classNames from 'classnames';
import { useSelector } from 'calypso/state';
import { useIsThemeAllowedOnSite } from 'calypso/state/themes/hooks/use-is-theme-allowed-on-site';
import { useThemeTierForTheme } from 'calypso/state/themes/hooks/use-theme-tier-for-theme';
import { getThemeType, isThemePurchased } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { ThemeTierBadgeContextProvider } from './theme-tier-badge-context';
import ThemeTierBundledBadge from './theme-tier-bundled-badge';
import ThemeTierCommunityBadge from './theme-tier-community-badge';
import ThemeTierPartnerBadge from './theme-tier-partner-badge';
import ThemeTierStyleVariationBadge from './theme-tier-style-variation-badge';
import ThemeTierUpgradeBadge from './theme-tier-upgrade-badge';

import './style.scss';

export default function ThemeTierBadge( {
	canGoToCheckout = true,
	className = '',
	isLockedStyleVariation,
	showUpgradeBadge = true,
	themeId,
} ) {
	const siteId = useSelector( getSelectedSiteId );
	const themeType = useSelector( ( state ) => getThemeType( state, themeId ) );
	const isLegacyPremiumPurchased = useSelector( ( state ) =>
		isThemePurchased( state, themeId, siteId )
	);
	const themeTier = useThemeTierForTheme( themeId );
	const isThemeAllowed = useIsThemeAllowedOnSite( siteId, themeId );

	const getBadge = () => {
		if ( BUNDLED_THEME === themeType ) {
			return <ThemeTierBundledBadge />;
		}

		if ( isLockedStyleVariation ) {
			return <ThemeTierStyleVariationBadge />;
		}

		if ( DOT_ORG_THEME === themeType ) {
			return <ThemeTierCommunityBadge />;
		}

		if ( 'partner' === themeTier.slug || MARKETPLACE_THEME === themeType ) {
			return <ThemeTierPartnerBadge />;
		}

		if ( isThemeAllowed || ( 'premium' === themeTier.slug && isLegacyPremiumPurchased ) ) {
			return null;
		}

		return <ThemeTierUpgradeBadge />;
	};

	return (
		<div className={ classNames( 'theme-tier-badge', className ) }>
			<ThemeTierBadgeContextProvider
				canGoToCheckout={ canGoToCheckout }
				showUpgradeBadge={ showUpgradeBadge }
				themeId={ themeId }
			>
				{ getBadge() }
			</ThemeTierBadgeContextProvider>
		</div>
	);
}
