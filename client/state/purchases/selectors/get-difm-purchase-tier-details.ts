import { formatCurrency } from '@automattic/format-currency';
import { getPurchases } from './get-purchases';

import 'calypso/state/purchases/init';

const formatPurchasePrice = ( price: number, currency: string ) =>
	formatCurrency( price, currency, {
		isSmallestUnit: true,
		stripZeros: true,
	} );

/**
 * Returns the tiered purchase details related to DIFM if available
 *
 * @param   {object} state       global state
 * @param   {number} purchaseId  the purchase id
 * @returns {object} difm purchase breakdown in smallest unit
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
	const difmPurchase = getPurchases( state ).find( ( purchase ) => purchase.id === purchaseId );
	if (
		! difmPurchase ||
		! difmPurchase.priceTierList ||
		! Array.isArray( difmPurchase.priceTierList ) ||
		difmPurchase.priceTierList.length === 0
	) {
		return null;
	}

	const [ tier0, tier1 ] = difmPurchase.priceTierList;
	const perExtraPagePrice = tier1.minimumPrice - tier0.minimumPrice;

	const { maximumUnits: numberOfIncludedPages, minimumPriceDisplay: formattedOneTimeFee } = tier0;
	const { purchaseRenewalQuantity: noOfPages, currencyCode } = difmPurchase;

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
