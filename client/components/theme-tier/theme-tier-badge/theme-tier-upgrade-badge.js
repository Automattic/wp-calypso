import {
	getPlan,
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
} from '@automattic/calypso-products';
import { PremiumBadge } from '@automattic/components';
import { Plans } from '@automattic/data-stores';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useSelector } from 'calypso/state';
import { getSitePlanSlug } from 'calypso/state/sites/selectors';
import { useThemeTierForTheme } from 'calypso/state/themes/hooks/use-theme-tier-for-theme';
import { getMarketplaceThemeSubscriptionPrices } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { THEME_TIERS } from '../constants';
import { useThemeTierBadgeContext } from './theme-tier-badge-context';

const MAX_LABEL_LENGTH = 45;

const useUpgradeLabel = ( showPartnerPrice, planName, subscriptionPrices, translate ) => {
	const siteId = useSelector( getSelectedSiteId );
	const planSlug = useSelector( ( state ) => getSitePlanSlug( state, siteId ) ?? '' );
	const isEcommerceTrialMonthly = planSlug === PLAN_ECOMMERCE_TRIAL_MONTHLY;

	const displayPlanName = isEcommerceTrialMonthly
		? getPlan( PLAN_ECOMMERCE )?.getTitle() ?? planName
		: planName;

	return useMemo( () => {
		if ( showPartnerPrice && subscriptionPrices.month ) {
			const fullLabel = translate( 'On %(planName)s + %(price)s/month', {
				args: {
					planName: displayPlanName,
					price: subscriptionPrices.month,
				},
			} );

			return fullLabel.length > MAX_LABEL_LENGTH
				? /* translators: This is a shorter version of the text "Available on %(planName)s plus %(price)s/month". */
				  translate( '%(planName)s + %(price)s/mo', {
						args: {
							planName: displayPlanName,
							price: subscriptionPrices.month,
						},
				  } )
				: fullLabel;
		}

		return translate( 'Available on %(planName)s', {
			args: { planName: displayPlanName },
		} );
	}, [ translate, showPartnerPrice, subscriptionPrices.month, displayPlanName ] );
};

export default function ThemeTierPlanUpgradeBadge( { showPartnerPrice, hideBackgroundOnUpgrade } ) {
	const translate = useTranslate();
	const { themeId } = useThemeTierBadgeContext();
	const themeTier = useThemeTierForTheme( themeId );

	const subscriptionPrices = useSelector(
		( state ) => getMarketplaceThemeSubscriptionPrices( state, themeId ),
		( prev, next ) => prev.month === next.month && prev.year === next.year
	);

	const tierMinimumUpsellPlan = THEME_TIERS[ themeTier?.slug ]?.minimumUpsellPlan;
	const mappedPlan = useMemo( () => getPlan( tierMinimumUpsellPlan ), [ tierMinimumUpsellPlan ] );
	const plans = Plans.usePlans( { coupon: undefined } );
	const planName = plans?.data?.[ mappedPlan.getStoreSlug() ]?.productNameShort;

	const labelText = useUpgradeLabel( showPartnerPrice, planName, subscriptionPrices, translate );

	return (
		<PremiumBadge
			className={ clsx( 'theme-tier-badge__content', {
				'theme-tier-badge__without-background': hideBackgroundOnUpgrade,
			} ) }
			focusOnShow={ false }
			labelText={ labelText }
			tooltipClassName="theme-tier-badge-tooltip"
			tooltipPosition="top"
			shouldHideTooltip
			isClickable={ false }
		/>
	);
}
