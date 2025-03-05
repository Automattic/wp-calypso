import { BUNDLED_THEME, DOT_ORG_THEME, MARKETPLACE_THEME } from '@automattic/design-picker';
import clsx from 'clsx';
import { useMemo } from 'react';
import { useSelector } from 'calypso/state';
import { useIsThemeAllowedOnSite } from 'calypso/state/themes/hooks/use-is-theme-allowed-on-site';
import { useThemeTierForTheme } from 'calypso/state/themes/hooks/use-theme-tier-for-theme';
import { getThemeType } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { ThemeTierBadgeContextProvider } from './theme-tier-badge-context';
import ThemeTierBundledBadge from './theme-tier-bundled-badge';
import ThemeTierCommunityBadge from './theme-tier-community-badge';
import ThemeTierFreeBadge from './theme-tier-free-badge';
import ThemeTierIncludedBadge from './theme-tier-included-badge';
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
	showPartnerPrice = false,
	isThemeList = false,
} ) {
	const siteId = useSelector( getSelectedSiteId );
	const themeType = useSelector( ( state ) => getThemeType( state, themeId ) );
	const themeTier = useThemeTierForTheme( themeId );
	const isThemeAllowed = useIsThemeAllowedOnSite( siteId, themeId );

	const badge = useMemo( () => {
		if ( themeTier?.slug === 'free' ) {
			return <ThemeTierFreeBadge />;
		}

		if (
			siteId &&
			isThemeAllowed &&
			! [ DOT_ORG_THEME, MARKETPLACE_THEME, BUNDLED_THEME ].includes( themeType )
		) {
			return <ThemeTierIncludedBadge />;
		}

		if ( themeType === BUNDLED_THEME ) {
			return (
				<ThemeTierBundledBadge
					hideBackgroundOnUpgrade={ isThemeList }
					hideBundledBadge={ isThemeList }
				/>
			);
		}

		if ( isLockedStyleVariation ) {
			return <ThemeTierStyleVariationBadge />;
		}

		if ( themeType === DOT_ORG_THEME ) {
			return (
				<ThemeTierCommunityBadge
					hideBackgroundOnUpgrade={ isThemeList }
					hideCommunityBadge={ isThemeList }
				/>
			);
		}

		if ( themeTier?.slug === 'partner' || themeType === MARKETPLACE_THEME ) {
			return (
				<ThemeTierPartnerBadge
					showPartnerPrice={ showPartnerPrice }
					hideBackgroundOnUpgrade={ isThemeList }
					isLongLabel={ ! isThemeList }
					hidePartnerBadge={ isThemeList }
				/>
			);
		}

		if ( ! isThemeAllowed && showUpgradeBadge ) {
			return (
				<ThemeTierUpgradeBadge
					showPartnerPrice={ showPartnerPrice }
					hideBackgroundOnUpgrade={ isThemeList }
				/>
			);
		}

		return null;
	}, [
		themeTier,
		siteId,
		isThemeAllowed,
		themeType,
		isLockedStyleVariation,
		showPartnerPrice,
		isThemeList,
		showUpgradeBadge,
	] );

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
