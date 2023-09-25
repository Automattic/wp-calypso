import { getDisplayPrices } from '../../lib/get-display-prices';
import type { AddOnMeta } from '@automattic/data-stores';

const LARGE_CURRENCY_CHAR_THRESHOLD = 7;

/**
 * Hook that returns true if the string representation of any price of any of the storage
 * add-ons exceeds 6 characters. For example, $4,000 would be 6 characters.
 * This is primarily used for lowering the font-size of "large" display prices.
 */
export function useIsLargeAddOnCurrency( {
	storageAddOns,
	currencyCode,
}: {
	storageAddOns: ( AddOnMeta | null )[] | null;
	currencyCode: string;
} ) {
	if ( ! storageAddOns ) {
		return false;
	}

	const addOnPrices = storageAddOns.map( ( addOn ) => addOn?.prices?.monthlyPrice ?? 0 );
	const displayPrices = getDisplayPrices( addOnPrices, currencyCode );
	return displayPrices.some( ( price ) => price.length > LARGE_CURRENCY_CHAR_THRESHOLD );
}
