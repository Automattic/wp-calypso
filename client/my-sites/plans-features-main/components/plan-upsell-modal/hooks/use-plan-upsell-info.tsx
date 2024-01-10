import { getPlan, type PlanSlug } from '@automattic/calypso-products';
import formatCurrency from '@automattic/format-currency';
import { useSelector } from 'calypso/state';
import { getPlanPrices } from 'calypso/state/plans/selectors/get-plan-prices';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import type { TranslateResult } from 'i18n-calypso';

export type PlanUpsellInfo = {
	planSlug: PlanSlug;
	title: TranslateResult;
	formattedPriceMonthly: string;
	formattedPriceFull: string;
};

// TODO:
// Replace `getPlanPrices` with the selectors from the Plans datastore.
export const usePlanUpsellInfo = ( planSlug: PlanSlug, currencyCode: string ): PlanUpsellInfo => {
	const title = getPlan( planSlug )?.getTitle() || '';
	const priceMonthly = useSelector( ( state ) => {
		const siteId = getSelectedSiteId( state ) ?? null;
		const rawPlanPrices = getPlanPrices( state, {
			planSlug,
			siteId,
			returnMonthly: true,
		} );
		return ( rawPlanPrices.discountedRawPrice || rawPlanPrices.rawPrice ) ?? 0;
	} );
	const priceFull = useSelector( ( state ) => {
		const siteId = getSelectedSiteId( state ) ?? null;
		const rawPlanPrices = getPlanPrices( state, {
			planSlug,
			siteId,
			returnMonthly: false,
		} );
		return ( rawPlanPrices.discountedRawPrice || rawPlanPrices.rawPrice ) ?? 0;
	} );

	return {
		planSlug,
		title,
		formattedPriceMonthly: formatCurrency( priceMonthly, currencyCode, { stripZeros: true } ),
		formattedPriceFull: formatCurrency( priceFull, currencyCode, { stripZeros: true } ),
	};
};
