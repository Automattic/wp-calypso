import { BUNDLED_THEME, DOT_ORG_THEME, MARKETPLACE_THEME } from '@automattic/design-picker';
import clsx from 'clsx';
import { useSelector } from 'calypso/state';
import { useIsThemeAllowedOnSite } from 'calypso/state/themes/hooks/use-is-theme-allowed-on-site';
import { useThemeTierForTheme } from 'calypso/state/themes/hooks/use-theme-tier-for-theme';
import { getThemeType } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { ThemeTierBadgeContextProvider } from './theme-tier-badge-context';
import ThemeTierCommunityBadge from './theme-tier-community-badge';
import ThemeTierFreeBadge from './theme-tier-free-badge';
import ThemeTierIncludedBadge from './theme-tier-included-badge';
import ThemeTierStyleVariationBadge from './theme-tier-style-variation-badge';
import ThemeTierUpgradeBadge from './theme-tier-upgrade-badge';

import './style.scss';

export default function ThemeTierBadge( {
	canGoToCheckout = true,
	className = '',
	isLockedStyleVariation,
	showUpgradeBadge = true,
	themeId,
	showPartnerPrice = false,
	hideBackgroundOnUpgrade = false,
} ) {
	const siteId = useSelector( getSelectedSiteId );
	const themeType = useSelector( ( state ) => getThemeType( state, themeId ) );
	const themeTier = useThemeTierForTheme( themeId );
	const isThemeAllowed = useIsThemeAllowedOnSite( siteId, themeId );
	const getBadge = () => {
		if ( ! siteId && themeTier?.slug === 'free' ) {
			return <ThemeTierFreeBadge />;
		}

		if ( siteId && isThemeAllowed ) {
			return <ThemeTierIncludedBadge />;
		}

		if ( BUNDLED_THEME === themeType ) {
			return (
				<ThemeTierUpgradeBadge
					showPartnerPrice={ showPartnerPrice }
					hideBackgroundOnUpgrade={ hideBackgroundOnUpgrade }
				/>
			);
		}

		if ( isLockedStyleVariation ) {
			return <ThemeTierStyleVariationBadge />;
		}

		if ( DOT_ORG_THEME === themeType ) {
			return <ThemeTierCommunityBadge />;
		}

		if ( 'partner' === themeTier?.slug || MARKETPLACE_THEME === themeType ) {
			return (
				<ThemeTierUpgradeBadge
					showPartnerPrice={ showPartnerPrice }
					hideBackgroundOnUpgrade={ hideBackgroundOnUpgrade }
				/>
			);
		}

		if ( ! isThemeAllowed && showUpgradeBadge ) {
			return (
				<ThemeTierUpgradeBadge
					showPartnerPrice={ showPartnerPrice }
					hideBackgroundOnUpgrade={ hideBackgroundOnUpgrade }
				/>
			);
		}

		return null;
	};

	const badge = getBadge();

	if ( ! badge ) {
		return null;
	}

	return (
		<div
			className={ clsx( 'theme-tier-badge', `theme-tier-badge--${ themeTier.slug }`, className ) }
		>
			<ThemeTierBadgeContextProvider
				canGoToCheckout={ canGoToCheckout }
				showUpgradeBadge={ showUpgradeBadge }
				themeId={ themeId }
			>
				{ badge }
			</ThemeTierBadgeContextProvider>
		</div>
	);
}
