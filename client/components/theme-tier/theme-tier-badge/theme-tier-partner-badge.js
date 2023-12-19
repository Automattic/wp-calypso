import { PLAN_BUSINESS, getPlan } from '@automattic/calypso-products';
import { PremiumBadge } from '@automattic/components';
import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { createInterpolateElement } from '@wordpress/element';
import i18n, { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import {
	isMarketplaceThemeSubscribed,
	getMarketplaceThemeSubscriptionPrices,
} from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useThemeTier from '../use-theme-tier';
import ThemeTierBadgeCheckoutLink from './theme-tier-badge-checkout-link';
import { useThemeTierBadgeContext } from './theme-tier-badge-context';
import ThemeTierBadgeTracker from './theme-tier-badge-tracker';
import ThemeTierTooltipTracker from './theme-tier-tooltip-tracker';

export default function ThemeTierPartnerBadge() {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const { themeId } = useThemeTierBadgeContext();
	const isEnglishLocale = useIsEnglishLocale();
	const isPartnerThemePurchased = useSelector( ( state ) =>
		siteId ? isMarketplaceThemeSubscribed( state, themeId, siteId ) : false
	);
	const subscriptionPrices = useSelector( ( state ) =>
		getMarketplaceThemeSubscriptionPrices( state, themeId )
	);
	const { isThemeAllowedOnSite } = useThemeTier( siteId, themeId );

	const labelText = isThemeAllowedOnSite
		? translate( 'Subscribe' )
		: translate( 'Upgrade and Subscribe' );

	const getTooltipMessage = () => {
		if ( isPartnerThemePurchased && ! isThemeAllowedOnSite ) {
			return createInterpolateElement(
				isEnglishLocale ||
					i18n.hasTranslation(
						'You have a subscription for this theme, but it will only be usable if you have the <link>%(businessPlanName)s plan</link> on your site.'
					)
					? translate(
							'You have a subscription for this theme, but it will only be usable if you have the <link>%(businessPlanName)s plan</link> on your site.',
							{ args: { businessPlanName: getPlan( PLAN_BUSINESS )?.getTitle() ?? '' } }
					  )
					: translate(
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
				isEnglishLocale ||
					/* translators: annualPrice and monthlyPrice are prices for the theme, examples: US$50, US$7; */
					i18n.hasTranslation(
						'This theme costs %(annualPrice)s per year or %(monthlyPrice)s per month, and can only be purchased if you have the <Link>%(businessPlanName)s plan</Link> on your site.'
					)
					? translate(
							'This theme costs %(annualPrice)s per year or %(monthlyPrice)s per month, and can only be purchased if you have the <Link>%(businessPlanName)s plan</Link> on your site.',
							{
								args: {
									annualPrice: subscriptionPrices.year ?? '',
									monthlyPrice: subscriptionPrices.month ?? '',
									businessPlanName: getPlan( PLAN_BUSINESS )?.getTitle() ?? '',
								},
							}
					  )
					: translate(
							'This theme costs %(annualPrice)s per year or %(monthlyPrice)s per month, and can only be purchased if you have the <Link>%(businessPlanName)s plan</Link> on your site.',
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
			{ ( ! isPartnerThemePurchased || ! isThemeAllowedOnSite ) && (
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
