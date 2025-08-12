import { getPlan, type PlanSlug } from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { formatCurrency } from '@automattic/number-formatters';
import useCheckPlanAvailabilityForPurchase from 'calypso/my-sites/plans-features-main/hooks/use-check-plan-availability-for-purchase';
import { useSelector } from 'calypso/state';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import type { TranslateResult } from 'i18n-calypso';

type PlanUpsellInfo = {
	title: TranslateResult;
	formattedPriceMonthly: string;
	formattedPriceFull: string;
};

export const usePlanUpsellInfo = ( { planSlug }: { planSlug: PlanSlug } ): PlanUpsellInfo => {
	const title = getPlan( planSlug )?.getTitle() || '';
	const siteId = useSelector( getSelectedSiteId );
	const pricingMeta = Plans.usePricingMetaForGridPlans( {
		planSlugs: [ planSlug ],
		siteId,
		coupon: undefined,
		useCheckPlanAvailabilityForPurchase,
	} );
	const currencyCode = pricingMeta?.[ planSlug ].currencyCode ?? 'USD';
	const priceMonthly =
		( pricingMeta?.[ planSlug ].discountedPrice.monthly ||
			pricingMeta?.[ planSlug ].originalPrice.monthly ) ??
		0;
	const priceFull =
		( pricingMeta?.[ planSlug ].discountedPrice.full ||
			pricingMeta?.[ planSlug ].originalPrice.full ) ??
		0;

	return {
		title,
		formattedPriceMonthly: formatCurrency( priceMonthly, currencyCode, {
			stripZeros: true,
			isSmallestUnit: true,
		} ),
		formattedPriceFull: formatCurrency( priceFull, currencyCode, {
			stripZeros: true,
			isSmallestUnit: true,
		} ),
	};
};
