import { getPlan } from '@automattic/calypso-products';
import { PremiumBadge } from '@automattic/components';
import { Plans } from '@automattic/data-stores';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useSelector } from 'calypso/state';
import { useThemeTierForTheme } from 'calypso/state/themes/hooks/use-theme-tier-for-theme';
import { getMarketplaceThemeSubscriptionPrices } from 'calypso/state/themes/selectors';
import { THEME_TIERS } from '../constants';
import { useThemeTierBadgeContext } from './theme-tier-badge-context';

const MAX_LABEL_LENGTH = 45;

const useUpgradeLabel = ( showPartnerPrice, planName, subscriptionPrices, translate ) => {
	return useMemo( () => {
		if ( showPartnerPrice && subscriptionPrices.month ) {
			const fullLabel = translate( 'On %(planName)s + %(price)s/month', {
				args: {
					planName,
					price: subscriptionPrices.month,
				},
			} );

			return fullLabel.length > MAX_LABEL_LENGTH
				? translate( '%(planName)s + %(price)s/mo', {
						args: {
							planName,
							price: subscriptionPrices.month,
						},
				  } )
				: fullLabel;
		}

		return translate( 'Available on %(planName)s', {
			args: { planName },
		} );
	}, [ translate, showPartnerPrice, subscriptionPrices.month, planName ] );
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
