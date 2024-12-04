import { getPlan } from '@automattic/calypso-products';
import { PremiumBadge } from '@automattic/components';
import { Plans } from '@automattic/data-stores';
import { createInterpolateElement } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useThemeTierForTheme } from 'calypso/state/themes/hooks/use-theme-tier-for-theme';
import { THEME_TIERS } from '../constants';
import ThemeTierBadgeCheckoutLink from './theme-tier-badge-checkout-link';
import { useThemeTierBadgeContext } from './theme-tier-badge-context';
import ThemeTierTooltipTracker from './theme-tier-tooltip-tracker';

export default function ThemeTierUpgradeBadge() {
	const translate = useTranslate();
	const { themeId } = useThemeTierBadgeContext();
	const themeTier = useThemeTierForTheme( themeId );

	const tierMinimumUpsellPlan = THEME_TIERS[ themeTier?.slug ]?.minimumUpsellPlan;
	const mappedPlan = getPlan( tierMinimumUpsellPlan );
	const planPathSlug = mappedPlan?.getPathSlug();

	// Using API plans because the updated getTitle() method doesn't take the experiment assignment into account.
	const plans = Plans.usePlans( { coupon: undefined } );
	const planName = plans?.data?.[ mappedPlan.getStoreSlug() ]?.productNameShort;

	const tooltipContent = (
		<>
			<ThemeTierTooltipTracker />
			<div data-testid="upsell-message">
				{ createInterpolateElement(
					// Translators: %(planName)s is the name of the plan that includes this theme. Examples: "Personal" or "Premium".
					translate( 'This theme is included in the <Link>%(planName)s plan</Link>.', {
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
		<PremiumBadge
			className="theme-tier-badge__content"
			focusOnShow={ false }
			isClickable
			labelText={ translate( 'Upgrade' ) }
			tooltipClassName="theme-tier-badge-tooltip"
			tooltipContent={ tooltipContent }
			tooltipPosition="top"
		/>
	);
}
