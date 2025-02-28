import { PRODUCT_1GB_SPACE } from '@automattic/calypso-products';
import * as Purchases from '../../purchases';
import useStorageAddOns from './use-storage-add-ons';
import type { AddOnMeta } from '../..';

export default function useGetPurchasedStorageAddOn( {
	siteId,
}: {
	siteId?: number | null;
} ): AddOnMeta | null {
	const storageAddOns = useStorageAddOns( { siteId } );
	const matchingPurchases = Purchases.useSitePurchasesByProductSlug( {
		siteId,
		productSlug: PRODUCT_1GB_SPACE,
	} );

	if ( ! matchingPurchases ) {
		return null;
	}

	const purchase: Purchases.Purchase = Object.values( matchingPurchases )[ 0 ];
	const storageAddOnQuantity = purchase.purchaseRenewalQuantity;
	return storageAddOns.find( ( addOn ) => addOn?.quantity === storageAddOnQuantity ) ?? null;
}
