import { PremiumBadge } from '@automattic/components';
import { createInterpolateElement } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import {
	isMarketplaceThemeSubscribed,
	getMarketplaceThemeSubscriptionPrices,
} from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useThemeTier from '../use-theme-tier';
import ThemeTierBadgeCheckoutLink from './theme-tier-badge-checkout-link';
import ThemeTierBadgeTracker from './theme-tier-badge-tracker';
import ThemeTierTooltipTracker from './theme-tier-tooltip-tracker';

export default function ThemeTierPartnerBadge( { themeId } ) {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const isPartnerThemePurchased = useSelector( ( state ) =>
		siteId ? isMarketplaceThemeSubscribed( state, themeId, siteId ) : false
	);
	const subscriptionPrices = useSelector( ( state ) =>
		getMarketplaceThemeSubscriptionPrices( state, themeId )
	);
	const { isThemeAllowedOnSite } = useThemeTier( siteId, themeId );

	if ( isPartnerThemePurchased && isThemeAllowedOnSite ) {
		return <span>{ translate( 'Included in my plan' ) }</span>;
	}

	const labelText = isThemeAllowedOnSite
		? translate( 'Subscribe' )
		: translate( 'Upgrade and Subscribe' );

	const getTooltipMessage = () => {
		if ( isPartnerThemePurchased && ! isThemeAllowedOnSite ) {
			return createInterpolateElement(
				translate(
					'You have a subscription for this theme, but it will only be usable if you have the <link>Business plan</link> on your site.'
				),
				{
					Link: <ThemeTierBadgeCheckoutLink plan="business" />,
				}
			);
		}
		if ( ! isPartnerThemePurchased && isThemeAllowedOnSite ) {
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
		if ( ! isPartnerThemePurchased && ! isThemeAllowedOnSite ) {
			return createInterpolateElement(
				/* translators: annualPrice and monthlyPrice are prices for the theme, examples: US$50, US$7; */
				translate(
					'This theme costs %(annualPrice)s per year or %(monthlyPrice)s per month, and can only be purchased if you have the <Link>Business plan</Link> on your site.',
					{
						args: {
							annualPrice: subscriptionPrices.year ?? '',
							monthlyPrice: subscriptionPrices.month ?? '',
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
			<div data-testid="upsell-header" className="theme-tier-badge-tooltip__header">
				{ translate( 'Partner theme', {
					context: 'This theme is developed and supported by a theme partner',
					textOnly: true,
				} ) }
			</div>
			<div data-testid="upsell-message">{ getTooltipMessage() }</div>
		</>
	);

	return (
		<>
			<ThemeTierBadgeTracker themeId={ themeId } />
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
	);
}
