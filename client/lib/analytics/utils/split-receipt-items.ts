import { isJetpackPlan, isJetpackProduct, isAkismetProduct } from '@automattic/calypso-products';
import costToUSD from './cost-to-usd';
import {
	getReceiptItemCost,
	getReceiptItemSlugObject,
	getReceiptTotal,
} from './receipt-item-details';
import type { Receipt, ReceiptItem } from '@automattic/api-core';

export type WpcomJetpackReceiptInfo = {
	akismetItems: ReceiptItem[];
	jetpackItems: ReceiptItem[];
	wpcomItems: ReceiptItem[];
	containsAkismetItems: boolean;
	containsJetpackItems: boolean;
	containsWpcomItems: boolean;
	akismetCost: number;
	jetpackCost: number;
	wpcomCost: number;
	akismetCostUSD: number;
	jetpackCostUSD: number;
	wpcomCostUSD: number;
	totalCostUSD: number;
};

function isJetpackItem( item: ReceiptItem ): boolean {
	const slugObject = getReceiptItemSlugObject( item );
	return isJetpackPlan( slugObject ) || isJetpackProduct( slugObject );
}

function isAkismetItem( item: ReceiptItem ): boolean {
	return isAkismetProduct( getReceiptItemSlugObject( item ) );
}

function sumItemCosts( items: ReceiptItem[], currency: string ): number {
	return items.reduce( ( total, item ) => total + getReceiptItemCost( item, currency ), 0 );
}

export function splitReceiptItems( receipt: Receipt ): WpcomJetpackReceiptInfo {
	const { currency } = receipt;
	const jetpackItems = receipt.items.filter( isJetpackItem );
	const akismetItems = receipt.items.filter( isAkismetItem );
	const wpcomItems = receipt.items.filter(
		( item ) => ! isJetpackItem( item ) && ! isAkismetItem( item )
	);

	const total = getReceiptTotal( receipt );
	const jetpackCost = sumItemCosts( jetpackItems, currency );
	const akismetCost = sumItemCosts( akismetItems, currency );
	const wpcomCost = total - jetpackCost - akismetCost;

	return {
		akismetItems,
		jetpackItems,
		wpcomItems,
		containsAkismetItems: 0 !== akismetItems.length,
		containsJetpackItems: 0 !== jetpackItems.length,
		containsWpcomItems: 0 !== wpcomItems.length,
		akismetCost,
		jetpackCost,
		wpcomCost,
		akismetCostUSD: costToUSD( akismetCost, currency ) ?? 0,
		jetpackCostUSD: costToUSD( jetpackCost, currency ) ?? 0,
		wpcomCostUSD: costToUSD( wpcomCost, currency ) ?? 0,
		totalCostUSD: costToUSD( total, currency ) ?? 0,
	};
}
