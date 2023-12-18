import { PLAN_PREMIUM, getPlan } from '@automattic/calypso-products';
import { PremiumBadge } from '@automattic/components';
import { useIsEnglishLocale } from '@automattic/i18n-utils';
import i18n, { useTranslate } from 'i18n-calypso';
import ThemeTierBadgeTracker from './theme-tier-badge-tracker';
import ThemeTierTooltipTracker from './theme-tier-tooltip-tracker';

export default function ThemeTierStyleVariationBadge() {
	const translate = useTranslate();
	const isEnglishLocale = useIsEnglishLocale();

	const tooltipContent = (
		<>
			<ThemeTierTooltipTracker />
			<div data-testid="upsell-header" className="theme-tier-badge-tooltip__header" />
			<div data-testid="upsell-message">
				{ isEnglishLocale ||
				i18n.hasTranslation(
					'Unlock this style, and tons of other features, by upgrading to a %(premiumPlanName)s plan.'
				)
					? translate(
							'Unlock this style, and tons of other features, by upgrading to a %(premiumPlanName)s plan.',
							{
								args: { premiumPlanName: getPlan( PLAN_PREMIUM )?.getTitle() },
							}
					  )
					: translate(
							'Unlock this style, and tons of other features, by upgrading to a Premium plan.'
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
