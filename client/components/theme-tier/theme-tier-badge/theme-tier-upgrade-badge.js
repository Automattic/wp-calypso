import { getPlan } from '@automattic/calypso-products';
import { PremiumBadge } from '@automattic/components';
import { Plans } from '@automattic/data-stores';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import useIsUpdatedBadgeDesign from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/design-setup/hooks/use-is-updated-badge-design';
import { useSelector } from 'calypso/state';
import { useThemeTierForTheme } from 'calypso/state/themes/hooks/use-theme-tier-for-theme';
import { getMarketplaceThemeSubscriptionPrices } from 'calypso/state/themes/selectors';
import { THEME_TIERS } from '../constants';
import { useThemeTierBadgeContext } from './theme-tier-badge-context';

export default function ThemeTierPlanUpgradeBadge( { showPartnerPrice } ) {
	const translate = useTranslate();
	const { themeId } = useThemeTierBadgeContext();
	const themeTier = useThemeTierForTheme( themeId );

	const tierMinimumUpsellPlan = THEME_TIERS[ themeTier?.slug ]?.minimumUpsellPlan;
	const mappedPlan = getPlan( tierMinimumUpsellPlan );
	const subscriptionPrices = useSelector( ( state ) =>
		getMarketplaceThemeSubscriptionPrices( state, themeId )
	);

	// Using API plans because the updated getTitle() method doesn't take the experiment assignment into account.
	const plans = Plans.usePlans( { coupon: undefined } );
	const planName = plans?.data?.[ mappedPlan.getStoreSlug() ]?.productNameShort;
	const isUpdatedBadgeDesign = useIsUpdatedBadgeDesign();

	const getLabel = () => {
		if ( ! isUpdatedBadgeDesign ) {
			return translate( 'Upgrade' );
		}

		if ( showPartnerPrice && subscriptionPrices.month ) {
			const fullLabel = translate( 'Available on %(planName)s plus %(price)s/month', {
				args: {
					planName: planName,
					price: subscriptionPrices.month,
				},
			} );

			// Use shorter version if full label is too long
			const MAX_LABEL_LENGTH = 45;
			return fullLabel.length > MAX_LABEL_LENGTH
				? /* translators: This is a shorter version of the text "Available on %(planName)s plus %(price)s/month". */
				  translate( '%(planName)s + %(price)s/mo', {
						args: {
							planName: planName,
							price: subscriptionPrices.month,
						},
				  } )
				: fullLabel;
		}

		return translate( 'Available on %(planName)s', {
			args: {
				planName: planName,
			},
		} );
	};

	return (
		<PremiumBadge
			className={ clsx( 'theme-tier-badge__content', {
				'theme-tier-badge__without-background': isUpdatedBadgeDesign,
			} ) }
			focusOnShow={ false }
			labelText={ getLabel() }
			tooltipClassName="theme-tier-badge-tooltip"
			tooltipPosition="top"
			shouldHideTooltip
			isClickable={ false }
		/>
	);
}
