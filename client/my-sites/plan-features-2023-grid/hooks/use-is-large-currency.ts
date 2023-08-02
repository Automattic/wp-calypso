import { useSelector } from 'calypso/state';
import { getPlanPrices } from 'calypso/state/plans/selectors';
import { IAppState } from 'calypso/state/types';
import type { PlanSlug } from '@automattic/calypso-products';

const LARGE_CURRENCY_CHAR_THRESHOLD = 5;

interface Props {
	planSlugs: PlanSlug[];
	returnMonthly?: boolean;
	siteId?: number | null;
}

/**
 * Hook that returns true if the string representation of any price (discounted/undiscounted)
 * of any of the plan slugs exceeds 5 characters.
 * This is primarily used for lowering the font-size of "large" display prices.
 */
export default function useIsLargeCurrency( {
	planSlugs,
	returnMonthly = true,
	siteId = null,
}: Props ): boolean {
	return useSelector( ( state: IAppState ) => {
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
