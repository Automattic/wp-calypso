import { formatCurrency } from '@automattic/format-currency';
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
export default function useIsLargeCurrency( { gridPlans, returnMonthly = true }: Props ) {
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
		const priceCharacterCounts = [
			originalPrice[ returnMonthly ? 'monthly' : 'full' ],
			discountedPrice[ returnMonthly ? 'monthly' : 'full' ],
		].map( ( price ) => {
			/**
			 * Prices are represented in smallest units for a currency, and not as prices that
			 * are actually displayed. Ex. $20 is the integer 2000, and not 20. To determine if
			 * the display price is too long, we convert the integer to a display string.
			 */
			return price
				? formatCurrency( price, currencyCode || 'USD', {
						stripZeros: true,
						isSmallestUnit: true,
				  } ).length
				: 0;
		} );

		const exceedsSingleCountThreshold = priceCharacterCounts.some(
			( charLength ) => charLength > LARGE_CURRENCY_CHAR_THRESHOLD
		);

		const exceedsCombinedCountThreshold =
			priceCharacterCounts.reduce( ( acc, price ) => acc + price, 0 ) >
			LARGE_CURRENCY_COMBINED_CHAR_THRESHOLD;

		return exceedsSingleCountThreshold || exceedsCombinedCountThreshold;
	} );
}
