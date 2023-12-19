import { getPlan } from '@automattic/calypso-products';
import { PremiumBadge } from '@automattic/components';
import { usePlans } from '@automattic/data-stores/src/plans';
import { createInterpolateElement } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { THEME_TIERS } from '../constants';
import useThemeTier from '../use-theme-tier';
import ThemeTierBadgeCheckoutLink from './theme-tier-badge-checkout-link';
import { useThemeTierBadgeContext } from './theme-tier-badge-context';
import ThemeTierBadgeTracker from './theme-tier-badge-tracker';
import ThemeTierTooltipTracker from './theme-tier-tooltip-tracker';

export default function ThemeTierUpgradeBadge() {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const { themeId } = useThemeTierBadgeContext();
	const { themeTier } = useThemeTier( siteId, themeId );

	const tierMinimumUpsellPlan = THEME_TIERS[ themeTier?.slug ]?.minimumUpsellPlan;
	const mappedPlan = getPlan( tierMinimumUpsellPlan );
	const planPathSlug = mappedPlan?.getPathSlug();

	// Using API plans because the updated getTitle() method doesn't take the experiment assignment into account.
	const plans = usePlans();
	const planName = plans?.data?.[ mappedPlan.getStoreSlug() ]?.productNameShort;

	const tooltipContent = (
		<>
			<ThemeTierTooltipTracker />
			<div data-testid="upsell-header" className="theme-tier-badge-tooltip__header">
				{
					// Translators: %(planName)s is the name of the plan that includes this theme. Examples: "Personal" or "Premium".
					translate( '%(planName)s theme', { textOnly: true, args: { planName } } )
				}
			</div>
			<div data-testid="upsell-message">
				{ createInterpolateElement(
					// Translators: %(planName)s is the name of the plan that includes this theme. Examples: "Personal" or "Premium".
					translate( 'This %(planName)s theme is included in the <Link>%(planName)s plan</Link>.', {
						args: { planName },
						textOnly: true,
					} ),
					{
						Link: <ThemeTierBadgeCheckoutLink plan={ planPathSlug } />,
					}
				) }
			</div>
		</>
	);

	return (
		<>
			<ThemeTierBadgeTracker themeId={ themeId } />
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
	);
}
