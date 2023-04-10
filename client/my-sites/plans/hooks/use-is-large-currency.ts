import { useSelector } from 'react-redux';
import { getPlanPrices } from 'calypso/state/plans/selectors';
import { IAppState } from 'calypso/state/types';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { PlanSlug } from '@automattic/calypso-products';

const LARGE_CURRENCY_CHAR_THRESHOLD = 5;

/**
 * Hook that returns true if the string representation of any price (discounted/undiscounted)
 * of any of the plan slugs exceeds 5 characters.
 * This is primarily used for lowering the font-size of "large" display prices.
 */
export default function useIsLargeCurrency( planSlugs: PlanSlug[], returnMonthly = true ): boolean {
	return useSelector( ( state: IAppState ) => {
		const siteId = getSelectedSiteId( state ) ?? null;
		return planSlugs.some( ( planSlug ) => {
			const { discountedRawPrice, planDiscountedRawPrice, rawPrice } = getPlanPrices( state, {
				planSlug,
				siteId,
				returnMonthly,
			} );
			return [ rawPrice, discountedRawPrice, planDiscountedRawPrice ].some(
				( price ) => price?.toString().length > LARGE_CURRENCY_CHAR_THRESHOLD
			);
		} );
	} );
}
