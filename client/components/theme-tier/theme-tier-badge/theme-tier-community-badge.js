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

	const getTooltipMessage = () => {
		if ( ! isEcommerceTrialMonthly ) {
			return createInterpolateElement(
				translate(
					'This community theme can only be installed if you have the <Link>%(businessPlanName)s plan</Link> or higher on your site.',
					{ args: { businessPlanName: getPlan( PLAN_BUSINESS )?.getTitle() ?? '' } }
				),
				{
					Link: <ThemeTierBadgeCheckoutLink plan={ planTooltipName } />,
				}
			);
		}
		if ( isEcommerceTrialMonthly ) {
			return createInterpolateElement(
				translate(
					"This theme can't be installed on a trial site. Please upgrade to the <Link>%(ecommercePlanName)s plan</Link> to install this theme.",
					{ args: { ecommercePlanName: getPlan( PLAN_ECOMMERCE )?.getTitle() ?? '' } }
				),
				{
					Link: <ThemeTierBadgeCheckoutLink plan={ planTooltipName } />,
				}
			);
		}
	};

	const tooltipContent = (
		<>
			<ThemeTierTooltipTracker />
			<div data-testid="upsell-message">{ getTooltipMessage() }</div>
		</>
	);

	return (
		<>
			{ showUpgradeBadge && ! isThemeIncluded && (
				<PremiumBadge
					className="theme-tier-badge__content"
					focusOnShow={ false }
					isClickable
					labelText={ translate( 'Upgrade' ) }
					tooltipClassName="theme-tier-badge-tooltip"
					tooltipContent={ tooltipContent }
					tooltipPosition="top"
				/>
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
