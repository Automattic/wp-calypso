import { PremiumBadge } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useSelector } from 'calypso/state';
import { useIsThemeAllowedOnSite } from 'calypso/state/themes/hooks/use-is-theme-allowed-on-site';
import {
	isMarketplaceThemeSubscribed,
	getMarketplaceThemeSubscriptionPrices,
} from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useThemeTierBadgeContext } from './theme-tier-badge-context';
import ThemeTierPlanUpgradeBadge from './theme-tier-upgrade-badge';

const commonBadgeProps = {
	focusOnShow: false,
	isClickable: false,
	shouldHideTooltip: true,
	shouldHideIcon: true,
};

export default function ThemeTierPartnerBadge( { showPartnerPrice, hideBackgroundOnUpgrade } ) {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const { themeId } = useThemeTierBadgeContext();

	const isPartnerThemePurchased = useSelector(
		( state ) => ( siteId ? isMarketplaceThemeSubscribed( state, themeId, siteId ) : false ),
		( prev, next ) => prev === next
	);

	const subscriptionPrices = useSelector(
		( state ) => getMarketplaceThemeSubscriptionPrices( state, themeId ),
		( prev, next ) => prev.month === next.month && prev.year === next.year
	);

	const isThemeAllowed = useIsThemeAllowedOnSite( siteId, themeId );

	const priceBadge = useMemo( () => {
		if ( ! isThemeAllowed ) {
			return (
				<ThemeTierPlanUpgradeBadge
					showPartnerPrice={ showPartnerPrice }
					hideBackgroundOnUpgrade={ hideBackgroundOnUpgrade }
				/>
			);
		}

		if ( ! isPartnerThemePurchased && subscriptionPrices.month ) {
			return (
				<PremiumBadge
					{ ...commonBadgeProps }
					className="theme-tier-badge__content"
					labelText={ translate( '%(price)s/month', {
						args: { price: subscriptionPrices.month },
					} ) }
				/>
			);
		}

		return null;
	}, [
		isThemeAllowed,
		isPartnerThemePurchased,
		subscriptionPrices.month,
		showPartnerPrice,
		hideBackgroundOnUpgrade,
		translate,
	] );

	return <>{ priceBadge }</>;
}
