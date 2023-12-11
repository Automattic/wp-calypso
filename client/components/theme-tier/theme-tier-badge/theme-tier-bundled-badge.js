import { BundledBadge, PremiumBadge } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import useBundleSettings from 'calypso/my-sites/theme/hooks/use-bundle-settings';
import { useSelector } from 'calypso/state';
import { canUseTheme } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import ThemeTierBadgeTracker from './theme-tier-badge-tracker';

export default function ThemeTierBundledBadge( { themeId } ) {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const bundleSettings = useBundleSettings( themeId );
	const legacyCanUseTheme = useSelector(
		( state ) => siteId && canUseTheme( state, siteId, themeId )
	);

	if ( ! bundleSettings ) {
		return;
	}

	const BadgeIcon = bundleSettings.iconComponent;

	return (
		<>
			{ ! legacyCanUseTheme && (
				<>
					<ThemeTierBadgeTracker themeId={ themeId } />
					<PremiumBadge
						className="theme-tier-badge__content"
						focusOnShow={ false }
						isClickable
						labelText={ translate( 'Upgrade' ) }
						tooltipClassName="theme-tier-badge-tooltip"
						tooltipContent={ null }
						tooltipPosition="top"
					/>
				</>
			) }

			<BundledBadge
				className="theme-tier-badge__content"
				color={ bundleSettings.color }
				icon={ <BadgeIcon /> }
				isClickable={ false }
				shouldHideTooltip
			>
				{ bundleSettings.name }
			</BundledBadge>

			{ !! legacyCanUseTheme && <span>{ translate( 'Included in my plan' ) }</span> }
		</>
	);
}
