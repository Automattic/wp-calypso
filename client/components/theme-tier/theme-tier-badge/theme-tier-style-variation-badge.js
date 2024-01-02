import { PLAN_PREMIUM, getPlan } from '@automattic/calypso-products';
import { PremiumBadge } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import ThemeTierBadgeTracker from './theme-tier-badge-tracker';
import ThemeTierTooltipTracker from './theme-tier-tooltip-tracker';

export default function ThemeTierStyleVariationBadge() {
	const translate = useTranslate();

	const tooltipContent = (
		<>
			<ThemeTierTooltipTracker />
			<div data-testid="upsell-header" className="theme-tier-badge-tooltip__header" />
			<div data-testid="upsell-message">
				{ translate(
					'Unlock this style, and tons of other features, by upgrading to a %(premiumPlanName)s plan.',
					{
						args: { premiumPlanName: getPlan( PLAN_PREMIUM )?.getTitle() },
					}
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
