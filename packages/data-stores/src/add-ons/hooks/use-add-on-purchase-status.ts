import { PRODUCT_1GB_SPACE } from '@automattic/calypso-products';
import i18n, { useTranslate } from 'i18n-calypso';
import * as Purchases from '../../purchases';
import * as Site from '../../site';
import { STORAGE_LIMIT } from '../constants';
import type { AddOnMeta } from '../types';

interface Props {
	addOnMeta: AddOnMeta;
	selectedSiteId?: number | null | undefined;
}

type AddOnPurchaseStatus = {
	available: boolean;
	hidden?: boolean;
	text?: ReturnType< typeof i18n.translate >;
};

/**
 * Returns whether add-on product has been purchased or included in site plan.
 */
const useAddOnPurchaseStatus = ( { addOnMeta, selectedSiteId }: Props ): AddOnPurchaseStatus => {
	const translate = useTranslate();
	const mediaStorage = Site.useSiteMediaStorage( { siteIdOrSlug: selectedSiteId } );
	const matchingPurchases = Purchases.useSitePurchasesByProductSlug( {
		siteId: selectedSiteId,
		productSlug: addOnMeta.productSlug,
	} );
	const siteFeatures = Site.useSiteFeatures( { siteIdOrSlug: selectedSiteId } );
	const isSiteFeature = addOnMeta.featureSlugs?.find(
		( slug ) => siteFeatures.data?.active?.includes( slug )
	);

	/*
	 * Order matters below:
	 * 1. Check if purchased. If storage add-on, check matching quantity.
	 * 2. If storage add-on, check if quantity is greater than the available upgrade.
	 * 3. Check if site already has this feature. Check this last since `siteFeatures.active`
	 *    involves both purchases and plan features.
	 */

	if ( matchingPurchases ) {
		if ( addOnMeta.productSlug === PRODUCT_1GB_SPACE ) {
			const purchase: Purchases.Purchase = Object.values( matchingPurchases )[ 0 ];
			if ( purchase.purchaseRenewalQuantity === addOnMeta.quantity ) {
				return { available: false, text: translate( 'Purchased' ) };
			}
		} else {
			return { available: false, text: translate( 'Purchased' ) };
		}
	}

	if ( addOnMeta.productSlug === PRODUCT_1GB_SPACE ) {
		const currentMaxStorage = mediaStorage.data?.maxStorageBytes
			? mediaStorage.data.maxStorageBytes / Math.pow( 1024, 3 )
			: 0;
		const availableStorageUpgrade = STORAGE_LIMIT - currentMaxStorage;
		const quantity = addOnMeta.quantity ?? 0;

		if ( quantity > availableStorageUpgrade ) {
			return { available: false, hidden: true };
		}
	}

	if ( isSiteFeature ) {
		return { available: false, text: translate( 'Included in your plan' ) };
	}

	return { available: true };
};

export default useAddOnPurchaseStatus;
