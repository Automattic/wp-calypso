import { PLAN_BUSINESS, getPlan } from '@automattic/calypso-products';
import { PremiumBadge } from '@automattic/components';
import { createInterpolateElement } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import {
	isMarketplaceThemeSubscribed,
	getMarketplaceThemeSubscriptionPrices,
	isThemeAllowedOnSite,
} from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import ThemeTierBadgeCheckoutLink from './theme-tier-badge-checkout-link';
import { useThemeTierBadgeContext } from './theme-tier-badge-context';
import ThemeTierBadgeTracker from './theme-tier-badge-tracker';
import ThemeTierTooltipTracker from './theme-tier-tooltip-tracker';

export default function ThemeTierPartnerBadge() {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const { themeId } = useThemeTierBadgeContext();
	const isPartnerThemePurchased = useSelector( ( state ) =>
		siteId ? isMarketplaceThemeSubscribed( state, themeId, siteId ) : false
	);
	const subscriptionPrices = useSelector( ( state ) =>
		getMarketplaceThemeSubscriptionPrices( state, themeId )
	);
	const isThemeAllowed = useSelector( ( state ) => isThemeAllowedOnSite( state, siteId, themeId ) );

	const labelText = isThemeAllowed
		? translate( 'Subscribe' )
		: translate( 'Upgrade and Subscribe' );

	const getTooltipMessage = () => {
		if ( isPartnerThemePurchased && ! isThemeAllowed ) {
			return createInterpolateElement(
				translate(
					'You have a subscription for this theme, but it will only be usable if you have the <link>%(businessPlanName)s plan</link> on your site.',
					{ args: { businessPlanName: getPlan( PLAN_BUSINESS )?.getTitle() ?? '' } }
				),
				{
					Link: <ThemeTierBadgeCheckoutLink plan="business" />,
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
		if ( ! isPartnerThemePurchased && ! isThemeAllowed ) {
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
					Link: <ThemeTierBadgeCheckoutLink plan="business" />,
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
			{ ( ! isPartnerThemePurchased || ! isThemeAllowed ) && (
				<>
					<ThemeTierBadgeTracker />
					<PremiumBadge
						className="theme-tier-badge__content"
						focusOnShow={ false }
						isClickable
						labelText={ labelText }
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
				labelText={ translate( 'Partner' ) }
				shouldHideIcon
				shouldHideTooltip
			/>
		</>
	);
}
