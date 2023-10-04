import { formatCurrency } from '@automattic/format-currency';
import { useMemo } from '@wordpress/element';

const LARGE_ADD_ON_CURRENCY_CHAR_THRESHOLD = 7;
const LARGE_CURRENCY_CHAR_THRESHOLD = 6;
const LARGE_CURRENCY_COMBINED_CHAR_THRESHOLD = 9;

interface Props {
	prices?: number[];
	isAddOn?: boolean;
	currencyCode: string;
}

function useDisplayPrices( currencyCode: string, prices?: number[] ) {
	/**
	 * Prices are represented in smallest units for a currency, and not as prices that
	 * are actually displayed. Ex. $20 is the integer 2000, and not 20. To determine if
	 * the display price is too long, we convert the integer to a display string.
	 */

	return useMemo(
		() =>
			prices?.map( ( price ) =>
				formatCurrency( price, currencyCode, {
					stripZeros: true,
					isSmallestUnit: true,
				} )
			),
		[ currencyCode, prices ]
	);
}

function hasExceededPriceThreshold( displayPrices?: string[], isAddOn = false ) {
	const threshold = isAddOn ? LARGE_ADD_ON_CURRENCY_CHAR_THRESHOLD : LARGE_CURRENCY_CHAR_THRESHOLD;
	return !! displayPrices?.some( ( price ) => price.length > threshold );
}

function hasExceededCombinedPriceThreshold( displayPrices?: string[] ) {
	let planPrices: string[] = [];
	let exceedsThreshold = false;

	displayPrices?.forEach( ( price ) => {
		const [ originalPrice, discountedPrice ] = planPrices;

		// pushes until a pair of original and discounted prices can be evaluated
		if ( ! originalPrice || ! discountedPrice ) {
			planPrices.push( price );
			return;
		}

		exceedsThreshold =
			originalPrice.length + discountedPrice.length > LARGE_CURRENCY_COMBINED_CHAR_THRESHOLD;

		// reset to evaluate the next pair of prices
		planPrices = [];
	} );

	return !! exceedsThreshold;
}

/**
 * Hook that returns true if the string representation of any price (discounted/undiscounted)
 * of any of the plan slugs exceeds 6 characters. For example, $4,000 would be 6 characters.
 * Additionally, also returns true if the combined discounted / undiscounted prices exceed
 * 9 characters. For example, $4,000 undiscounted and $30 discounted would be 9 characters.
 * This is primarily used for lowering the font-size of "large" display prices.
 */
export default function useIsLargeCurrency( { prices, isAddOn = false, currencyCode }: Props ) {
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
	const displayPrices = useDisplayPrices( currencyCode, prices );
	const exceedsPriceThreshold = hasExceededPriceThreshold( displayPrices, isAddOn );
	const exceedsCombinedPriceThreshold = hasExceededCombinedPriceThreshold( displayPrices );

	return isAddOn ? exceedsPriceThreshold : exceedsPriceThreshold || exceedsCombinedPriceThreshold;
}
