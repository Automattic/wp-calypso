import {
	PLAN_BUSINESS,
	getPlan,
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
} from '@automattic/calypso-products';
import { PremiumBadge } from '@automattic/components';
import { createInterpolateElement } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getSitePlanSlug } from 'calypso/state/sites/selectors';
import { canUseTheme } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import ThemeTierBadgeCheckoutLink from './theme-tier-badge-checkout-link';
import { useThemeTierBadgeContext } from './theme-tier-badge-context';
import ThemeTierBadgeTracker from './theme-tier-badge-tracker';
import ThemeTierTooltipTracker from './theme-tier-tooltip-tracker';

export default function ThemeTierCommunityBadge() {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const { showUpgradeBadge, themeId } = useThemeTierBadgeContext();
	const isThemeIncluded = useSelector(
		( state ) => siteId && canUseTheme( state, siteId, themeId )
	);

	const planSlug = useSelector( ( state ) => getSitePlanSlug( state, siteId ) ?? '' );
	const isEcommerceTrialMonthly = planSlug === PLAN_ECOMMERCE_TRIAL_MONTHLY;
	const planTooltipName = isEcommerceTrialMonthly ? 'ecommerce' : 'business';
	const planTooltipTitle = isEcommerceTrialMonthly
		? getPlan( PLAN_ECOMMERCE )?.getTitle()
		: getPlan( PLAN_BUSINESS )?.getTitle();

	const tooltipContent = (
		<>
			<ThemeTierTooltipTracker />
			<div data-testid="upsell-message">
				{ createInterpolateElement(
					translate(
						'This community theme can only be installed if you have the <Link>%(planName)s plan</Link> or higher on your site.',
						{ args: { planName: planTooltipTitle ?? '' } }
					),
					{
						Link: <ThemeTierBadgeCheckoutLink plan={ planTooltipName } />,
					}
				) }
			</div>
		</>
	);

	return (
		<>
			{ showUpgradeBadge && ! isThemeIncluded && (
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

			<PremiumBadge
				className="theme-tier-badge__content is-third-party"
				focusOnShow={ false }
				isClickable={ false }
				labelText={ translate( 'Community' ) }
				shouldHideIcon
				shouldHideTooltip
			/>
		</>
	);
}
