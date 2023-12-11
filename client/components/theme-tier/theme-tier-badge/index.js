import { BUNDLED_THEME, DOT_ORG_THEME, MARKETPLACE_THEME } from '@automattic/design-picker';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getThemeType } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useThemeTier from '../use-theme-tier';
import { ThemeTierBadgeContextProvider } from './theme-tier-badge-context';
import ThemeTierBundledBadge from './theme-tier-bundled-badge';
import ThemeTierCommunityBadge from './theme-tier-community-badge';
import ThemeTierPartnerBadge from './theme-tier-partner-badge';
import ThemeTierStyleVariationBadge from './theme-tier-style-variation-badge';
import ThemeTierUpgradeBadge from './theme-tier-upgrade-badge';

import './style.scss';

export default function ThemeTierBadge( {
	canGoToCheckout = true,
	isLockedStyleVariation,
	themeId,
} ) {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const themeType = useSelector( ( state ) => getThemeType( state, themeId ) );
	const { themeTier, isThemeAllowedOnSite } = useThemeTier( siteId, themeId );

	const getBadge = () => {
		if ( BUNDLED_THEME === themeType ) {
			return <ThemeTierBundledBadge />;
		}

		if ( isLockedStyleVariation ) {
			return <ThemeTierStyleVariationBadge themeId={ themeId } />;
		}

		if ( DOT_ORG_THEME === themeType ) {
			return <ThemeTierCommunityBadge themeId={ themeId } />;
		}

		if ( 'partner' === themeTier.slug || MARKETPLACE_THEME === themeType ) {
			return <ThemeTierPartnerBadge themeId={ themeId } />;
		}

		if ( isThemeAllowedOnSite ) {
			return <span>{ siteId ? translate( 'Included in my plan' ) : translate( 'Free' ) }</span>;
		}

		return <ThemeTierUpgradeBadge themeId={ themeId } />;
	};

	return (
		<div className="theme-tier-badge">
			<ThemeTierBadgeContextProvider canGoToCheckout={ canGoToCheckout } themeId={ themeId }>
				{ getBadge() }
			</ThemeTierBadgeContextProvider>
		</div>
	);
}
