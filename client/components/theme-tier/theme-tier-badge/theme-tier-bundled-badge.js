import { PLAN_BUSINESS, getPlan } from '@automattic/calypso-products';
import { BundledBadge } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import useIsUpdatedBadgeDesign from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/design-setup/hooks/use-is-updated-badge-design';
import { useBundleSettingsByTheme } from 'calypso/my-sites/theme/hooks/use-bundle-settings';
import { useSelector } from 'calypso/state';
import { canUseTheme } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useThemeTierBadgeContext } from './theme-tier-badge-context';
import ThemeTierIncludedBadge from './theme-tier-included-badge';
import ThemeTierUpgradeBadge from './theme-tier-upgrade-badge';

export default function ThemeTierBundledBadge( { hideBackgroundOnUpgrade } ) {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const { showUpgradeBadge, themeId } = useThemeTierBadgeContext();

	const bundleSettings = useBundleSettingsByTheme( themeId );
	const isThemeIncluded = useSelector(
		( state ) => siteId && canUseTheme( state, siteId, themeId ),
		( prev, next ) => prev === next
	);
	const isUpdatedBadgeDesign = useIsUpdatedBadgeDesign();

	if ( ! bundleSettings ) {
		return null;
	}

	const { iconComponent: BadgeIcon, name: bundleName, color } = bundleSettings;

	return (
		<div className="theme-tier-badge">
			{ showUpgradeBadge && ! isThemeIncluded && (
				<ThemeTierUpgradeBadge hideBackgroundOnUpgrade={ hideBackgroundOnUpgrade } />
			) }

			{ isThemeIncluded && <ThemeTierIncludedBadge /> }

			{ ! isUpdatedBadgeDesign && (
				<BundledBadge
					className="theme-tier-badge__content is-bundled-theme"
					color={ color }
					icon={ <BadgeIcon /> }
					isClickable={ false }
					shouldHideTooltip
				>
					{ bundleName }
				</BundledBadge>
			) }
		</div>
	);
}
