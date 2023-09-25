import { getDisplayPrices } from '../../lib/get-display-prices';
import type { GridPlan } from 'calypso/my-sites/plans-grid/hooks/npm-ready/data-store/use-grid-plans';

const LARGE_CURRENCY_CHAR_THRESHOLD = 6;
const LARGE_CURRENCY_COMBINED_CHAR_THRESHOLD = 9;

interface Props {
	gridPlans: GridPlan[];
	returnMonthly?: boolean;
}

/**
 * Hook that returns true if the string representation of any price (discounted/undiscounted)
 * of any of the plan slugs exceeds 6 characters. For example, $4,000 would be 6 characters.
 * Additionally, also returns true if the combined discounted / undiscounted prices exceed
 * 9 characters. For example, $4,000 undiscounted and $30 discounted would be 9 characters.
 * This is primarily used for lowering the font-size of "large" display prices.
 */
export default function useIsLargePlanCurrency( { gridPlans, returnMonthly = true }: Props ) {
	return gridPlans.some( ( gridPlan ) => {
		const {
			pricing: { originalPrice, discountedPrice, currencyCode },
		} = gridPlan;

		/**
		 * Because this hook is primarily used for lowering font-sizes of "large" display prices,
		 * this implementation is non-ideal. It assumes that each character in the display price,
		 * including currency symbols, comma separators, decimal points, etc. are all the same width.
		 *
		 * For the time being, however, this is a good enough approximation and works with our existing
		 * currencies. We'll need to update this in the near future, especially to prevent issues with
		 * newly introduced currencies.
		 *
		 * https://github.com/Automattic/wp-calypso/pull/81537#discussion_r1323182287
		 */
		const displayPrices = getDisplayPrices(
			[
				originalPrice[ returnMonthly ? 'monthly' : 'full' ],
				discountedPrice[ returnMonthly ? 'monthly' : 'full' ],
			],
			currencyCode || 'USD'
		);

		const exceedsSingleCountThreshold = displayPrices.some(
			( price ) => price.length > LARGE_CURRENCY_CHAR_THRESHOLD
		);

		const exceedsCombinedCountThreshold =
			displayPrices.reduce( ( acc, price ) => acc + price.length, 0 ) >
			LARGE_CURRENCY_COMBINED_CHAR_THRESHOLD;

		return exceedsSingleCountThreshold || exceedsCombinedCountThreshold;
	} );
}
