import { getCurrencyObject } from '@automattic/format-currency';
import type { GridPlan } from 'calypso/my-sites/plan-features-2023-grid/hooks/npm-ready/data-store/use-grid-plans';

const LARGE_CURRENCY_CHAR_THRESHOLD = 6;

interface Props {
	gridPlans: GridPlan[];
	returnMonthly?: boolean;
}

/**
 * Hook that returns true if the string representation of any price (discounted/undiscounted)
 * of any of the plan slugs exceeds 6 characters. For example, 14,000 would be 6 characters.
 * This is primarily used for lowering the font-size of "large" display prices.
 */
export default function useIsLargeCurrency( { gridPlans, returnMonthly = true }: Props ) {
	return gridPlans.some( ( gridPlan ) => {
		const {
			pricing: { originalPrice, discountedPrice, currencyCode },
		} = gridPlan;

		return [
			originalPrice[ returnMonthly ? 'monthly' : 'full' ],
			discountedPrice[ returnMonthly ? 'monthly' : 'full' ],
		].some( ( price ) => {
			if ( ! price ) {
				return false;
			}

			/**
			 * Prices are represented in smallest units for a currency, and not as prices that
			 * are actually displayed. Ex. $20 is the integer 2000, and not 20. To determine if
			 * the display price is too long, we convert the integer to a display string.
			 */
			const currencyObject = getCurrencyObject( price, currencyCode || 'USD', {
				stripZeros: true,
				isSmallestUnit: true,
			} );

			/**
			 * This implementation is non-ideal, as it does not take into account currency symbols
			 * that span multiple characters Ex. HKD -> HK$ or IDR -> Rp. For the time being,
			 * however, this is a good enough approximation and works with all of our existing
			 * currencies. We'll need to update this in the near future, especially to prevent issues with
			 * newly introduced currencies.
			 *
			 * https://github.com/Automattic/wp-calypso/pull/81537#discussion_r1323182287
			 */
			const priceToMeasure =
				currencyObject.integer +
				( currencyObject.hasNonZeroFraction ? currencyObject.fraction : '' );

			return priceToMeasure.length > LARGE_CURRENCY_CHAR_THRESHOLD;
		} );
	} );
}
