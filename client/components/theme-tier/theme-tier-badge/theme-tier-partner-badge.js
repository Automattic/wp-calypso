import {
	PLAN_BUSINESS,
	getPlan,
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
	PLAN_ECOMMERCE,
} from '@automattic/calypso-products';
import { PremiumBadge } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { createInterpolateElement } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getSitePlanSlug } from 'calypso/state/sites/selectors';
import { useIsThemeAllowedOnSite } from 'calypso/state/themes/hooks/use-is-theme-allowed-on-site';
import {
	isMarketplaceThemeSubscribed,
	getMarketplaceThemeSubscriptionPrices,
} from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import ThemeTierBadgeCheckoutLink from './theme-tier-badge-checkout-link';
import { useThemeTierBadgeContext } from './theme-tier-badge-context';
import ThemeTierTooltipTracker from './theme-tier-tooltip-tracker';

export default function ThemeTierPartnerBadge() {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const planSlug = useSelector( ( state ) => getSitePlanSlug( state, siteId ) ?? '' );

	const isEcommerceTrialMonthly = planSlug === PLAN_ECOMMERCE_TRIAL_MONTHLY;
	const planTooltipName = isEcommerceTrialMonthly ? 'ecommerce' : 'business';

	const { showUpgradeBadge, themeId } = useThemeTierBadgeContext();
	const isPartnerThemePurchased = useSelector( ( state ) =>
		siteId ? isMarketplaceThemeSubscribed( state, themeId, siteId ) : false
	);
	const subscriptionPrices = useSelector( ( state ) =>
		getMarketplaceThemeSubscriptionPrices( state, themeId )
	);
	const isThemeAllowed = useIsThemeAllowedOnSite( siteId, themeId );

	const labelText = isThemeAllowed
		? translate( 'Subscribe' )
		: translate( 'Upgrade and Subscribe' );

	const getTooltipMessage = () => {
		if ( isPartnerThemePurchased && ! isThemeAllowed && ! isEcommerceTrialMonthly ) {
			return createInterpolateElement(
				translate(
					'You have a subscription for this theme, but it will only be usable if you have the <link>%(businessPlanName)s plan</link> or higher on your site.',
					{ args: { businessPlanName: getPlan( PLAN_BUSINESS )?.getTitle() ?? '' } }
				),
				{
					Link: <ThemeTierBadgeCheckoutLink plan={ planTooltipName } />,
				}
			);
		}

		if ( isPartnerThemePurchased && ! isThemeAllowed && isEcommerceTrialMonthly ) {
			return createInterpolateElement(
				translate(
					"You have a subscription for this theme, but it isn't usable on a trial plan site. Please upgrade to the <link>%(ecommercePlanName)s plan</link> to install this theme.",
					{ args: { ecommercePlanName: getPlan( PLAN_ECOMMERCE )?.getTitle() ?? '' } }
				),
				{
					Link: <ThemeTierBadgeCheckoutLink plan={ planTooltipName } />,
				}
			);
		}
		if ( ! isPartnerThemePurchased && isThemeAllowed ) {
			/* translators: annualPrice and monthlyPrice are prices for the theme, examples: US$50, US$7; */
			return translate(
				'This theme is only available while your current plan is active and costs %(annualPrice)s per year or %(monthlyPrice)s per month.',
				{
					args: {
						annualPrice: subscriptionPrices.year ?? '',
						monthlyPrice: subscriptionPrices.month ?? '',
					},
				}
			);
		}
		if ( ! isPartnerThemePurchased && ! isThemeAllowed && ! isEcommerceTrialMonthly ) {
			return createInterpolateElement(
				/* translators: annualPrice and monthlyPrice are prices for the theme, examples: US$50, US$7; */
				translate(
					'This theme costs %(annualPrice)s per year or %(monthlyPrice)s per month, and can only be purchased if you have the <Link>%(businessPlanName)s plan</Link> on your site.',
					{
						args: {
							annualPrice: subscriptionPrices.year ?? '',
							monthlyPrice: subscriptionPrices.month ?? '',
							businessPlanName: getPlan( PLAN_BUSINESS )?.getTitle() ?? '',
						},
					}
				),
				{
					Link: <ThemeTierBadgeCheckoutLink plan={ planTooltipName } />,
				}
			);
		}
		if ( ! isPartnerThemePurchased && ! isThemeAllowed && isEcommerceTrialMonthly ) {
			return createInterpolateElement(
				/* translators: annualPrice and monthlyPrice are prices for the theme, examples: US$50, US$7; */
				translate(
					"This theme costs %(annualPrice)s per year or %(monthlyPrice)s per month, and can't be purchased on a trial site. Please upgrade to the <Link>%(ecommercePlanName)s plan</Link> to install this theme.",
					{
						args: {
							annualPrice: subscriptionPrices.year ?? '',
							monthlyPrice: subscriptionPrices.month ?? '',
							ecommercePlanName: getPlan( PLAN_ECOMMERCE )?.getTitle() ?? '',
						},
					}
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

	const partnerTooltipContent = (
		<>
			<div data-testid="upsell-message">
				{ translate(
					'{{a}}Partner themes{{/a}} are developed by third-party creators who have made their themes available to purchase and install directly through your WordPress.com dashboard.',
					{
						components: {
							a: (
								<a
									href={ localizeUrl( 'https://wordpress.com/support/themes/partner-themes/' ) }
									target="_blank"
									rel="noreferrer"
								></a>
							),
						},
					}
				) }
			</div>
		</>
	);

	return (
		<>
			{ showUpgradeBadge && ( ! isPartnerThemePurchased || ! isThemeAllowed ) && (
				<PremiumBadge
					className="theme-tier-badge__content"
					focusOnShow={ false }
					isClickable
					labelText={ labelText }
					tooltipClassName="theme-tier-badge-tooltip"
					tooltipContent={ tooltipContent }
					tooltipPosition="top"
				/>
			) }

			<PremiumBadge
				className="theme-tier-badge__content is-third-party"
				focusOnShow={ false }
				isClickable={ false }
				labelText={ translate( 'Partner' ) }
				shouldHideIcon
				tooltipClassName="theme-tier-badge-tooltip"
				tooltipContent={ partnerTooltipContent }
				tooltipPosition="top"
			/>
		</>
	);
}
