import { BundledBadge, PremiumBadge } from '@automattic/components';
import { createInterpolateElement } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import useBundleSettings from 'calypso/my-sites/theme/hooks/use-bundle-settings';
import { useSelector } from 'calypso/state';
import { canUseTheme } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import ThemeTierBadgeCheckoutLink from './theme-tier-badge-checkout-link';
import { useThemeTierBadgeContext } from './theme-tier-badge-context';
import ThemeTierBadgeTracker from './theme-tier-badge-tracker';
import ThemeTierTooltipTracker from './theme-tier-tooltip-tracker';

export default function ThemeTierBundledBadge() {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const { themeId } = useThemeTierBadgeContext();
	const bundleSettings = useBundleSettings( themeId );
	const legacyCanUseTheme = useSelector(
		( state ) => siteId && canUseTheme( state, siteId, themeId )
	);

	if ( ! bundleSettings ) {
		return;
	}

	const BadgeIcon = bundleSettings.iconComponent;
	const bundleName = bundleSettings.name;

	const tooltipContent = (
		<>
			<ThemeTierTooltipTracker />
			<div data-testid="upsell-header" className="theme-tier-badge-tooltip__header">
				{
					// Translators: %(bundleName)s is the name of the bundle, sometimes represented as a product name. Examples: "WooCommerce" or "Special".
					translate( '%(bundleName)s theme', { textOnly: true, args: { bundleName } } )
				}
			</div>
			<div data-testid="upsell-message">
				{ createInterpolateElement(
					// Translators: %(bundleName)s is the name of the bundle, sometimes represented as a product name. Examples: "WooCommerce" or "Special".
					translate( 'This %(bundleName)s theme is included in the <Link>Business plan</Link>.', {
						args: { bundleName },
						textOnly: true,
					} ),
					{
						Link: <ThemeTierBadgeCheckoutLink plan="business" />,
					}
				) }
			</div>
		</>
	);

	return (
		<div className="theme-tier-badge">
			{ ! legacyCanUseTheme && (
				<>
					<ThemeTierBadgeTracker />
					<PremiumBadge
						className="theme-tier-badge__content"
						focusOnShow={ false }
						isClickable
						labelText={ translate( 'Upgrade' ) }
						tooltipClassName="theme-tier-badge-tooltip"
						tooltipContent={ tooltipContent }
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
				{ bundleName }
			</BundledBadge>
		</div>
	);
}
