import { isDIFMProduct } from '@automattic/calypso-products';
import { formatCurrency } from '@automattic/format-currency';
import { getPurchases } from './get-purchases';

import 'calypso/state/purchases/init';

const formatPurchasePrice = ( price: number, currency: string ) =>
	formatCurrency( price, currency, {
		isSmallestUnit: true,
		stripZeros: true,
	} );

/**
 * Returns meaningful DIFM purchase details related to tiered difm prices if available
 * Returns null if this is not a DIFM purchase or the proper related price tier information is not available.
 *
 * @param   {object} state       global state
 * @param   {number} purchaseId  the purchase id
 * @returns {object | null} difm price tier based purchase information breakdown
 */
export const getDIFMTieredPurchaseDetails = (
	state: any,
	purchaseId: number
): {
	extraPageCount: number | null;
	formattedCostOfExtraPages: string | null;
	formattedOneTimeFee: string;
	numberOfIncludedPages: number | null | undefined;
} | null => {
	const purchase = getPurchases( state ).find( ( purchase ) => purchase.id === purchaseId );

	if (
		! purchase ||
		isDIFMProduct( purchase ) ||
		! purchase.priceTierList ||
		! Array.isArray( purchase.priceTierList ) ||
		purchase.priceTierList.length === 0
	) {
		return null;
	}

	const [ tier0, tier1 ] = purchase.priceTierList;
	const perExtraPagePrice = tier1.minimumPrice - tier0.minimumPrice;

	const { maximumUnits: numberOfIncludedPages, minimumPriceDisplay: formattedOneTimeFee } = tier0;
	const { purchaseRenewalQuantity: noOfPages, currencyCode } = purchase;

	let formattedCostOfExtraPages: string | null = null;
	let extraPageCount: number | null = null;
	if ( noOfPages && numberOfIncludedPages ) {
		extraPageCount = noOfPages - numberOfIncludedPages;
		formattedCostOfExtraPages = formatPurchasePrice(
			extraPageCount * perExtraPagePrice,
			currencyCode
		);
	}

	return { extraPageCount, numberOfIncludedPages, formattedCostOfExtraPages, formattedOneTimeFee };
};
