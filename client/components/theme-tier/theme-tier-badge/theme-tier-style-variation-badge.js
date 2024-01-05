import { PLAN_PREMIUM, getPlan } from '@automattic/calypso-products';
import { PremiumBadge } from '@automattic/components';
import { createInterpolateElement } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import ThemeTierBadgeCheckoutLink from './theme-tier-badge-checkout-link';
import ThemeTierBadgeTracker from './theme-tier-badge-tracker';
import ThemeTierTooltipTracker from './theme-tier-tooltip-tracker';

export default function ThemeTierStyleVariationBadge() {
	const translate = useTranslate();

	const premiumPlan = getPlan( PLAN_PREMIUM );

	const tooltipContent = (
		<>
			<ThemeTierTooltipTracker />
			<div data-testid="upsell-header" className="theme-tier-badge-tooltip__header" />
			<div data-testid="upsell-message">
				{ createInterpolateElement(
					// Translators: %(premiumPlanName)s is the name of the premium plan that includes this theme. Examples: "Explorer" or "Premium".
					translate(
						'Unlock this style, and tons of other features, by upgrading to a <Link>%(premiumPlanName)s plan</Link>.',
						{ args: { premiumPlanName: premiumPlan?.getTitle() } }
					),
					{ Link: <ThemeTierBadgeCheckoutLink plan={ premiumPlan?.getPathSlug() } /> }
				) }
			</div>
		</>
	);

	return (
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
	);
}
