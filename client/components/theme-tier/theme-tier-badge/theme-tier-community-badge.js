import { PremiumBadge } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { canUseTheme } from 'calypso/state/themes/selectors';
import { useThemeTierBadgeContext } from './theme-tier-badge-context';
import ThemeTierIncludedBadge from './theme-tier-included-badge';
import ThemeTierPlanUpgradeBadge from './theme-tier-upgrade-badge';

export default function ThemeTierCommunityBadge( { hideBackgroundOnUpgrade, hideCommunityBadge } ) {
	const translate = useTranslate();
	const { showUpgradeBadge, themeId, siteId } = useThemeTierBadgeContext();

	const isThemeIncluded = useSelector(
		( state ) => siteId && canUseTheme( state, siteId, themeId )
	);

	return (
		<>
			{ showUpgradeBadge && ! isThemeIncluded && (
				<ThemeTierPlanUpgradeBadge hideBackgroundOnUpgrade={ hideBackgroundOnUpgrade } />
			) }

			{ isThemeIncluded && <ThemeTierIncludedBadge /> }

			{ ! hideCommunityBadge && (
				<PremiumBadge
					className="theme-tier-badge__content is-third-party"
					focusOnShow={ false }
					isClickable={ false }
					labelText={ translate( 'Community' ) }
					shouldHideIcon
					shouldHideTooltip
				/>
			) }
		</>
	);
}
