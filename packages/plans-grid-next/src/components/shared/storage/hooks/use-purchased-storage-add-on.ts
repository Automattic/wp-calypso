import { PRODUCT_1GB_SPACE } from '@automattic/calypso-products';
import { Purchases, AddOns } from '@automattic/data-stores';
import { useMemo } from '@wordpress/element';
import { usePlansGridContext } from '../../../../grid-context';

// TODO
// how can we eliminate the need of mapping like this?
// ideally, there shouldn't be additional add on slug, but only the consistent product slug being used
// throughout the backend and the frontend.
const quantityToAddOnSlug = ( quantity: number ): AddOns.StorageAddOnSlug | null => {
	switch ( quantity ) {
		case 50:
			return AddOns.ADD_ON_50GB_STORAGE;
		case 100:
			return AddOns.ADD_ON_100GB_STORAGE;
		case 150:
			return AddOns.ADD_ON_150GB_STORAGE;
		case 200:
			return AddOns.ADD_ON_200GB_STORAGE;
		case 250:
			return AddOns.ADD_ON_250GB_STORAGE;
		case 300:
			return AddOns.ADD_ON_300GB_STORAGE;
		case 350:
			return AddOns.ADD_ON_350GB_STORAGE;
		default:
			return null;
	}
};

export default function usePurchasedStorageAddOn(): AddOns.AddOnMeta | null {
	const { siteId } = usePlansGridContext();
	const spaceUpgradesPurchased = Purchases.useSitePurchasesByProductSlug( {
		siteId,
		productSlug: PRODUCT_1GB_SPACE,
	} );
	const storageAddOns = AddOns.useStorageAddOns( { siteId } );

	return useMemo( () => {
		if ( ! spaceUpgradesPurchased ) {
			return null;
		}

		// storage add-on is a tiered product, so we can assume it contains only one product entry here.
		const purchasedAddOnSlug = quantityToAddOnSlug(
			Object.values( spaceUpgradesPurchased )[ 0 ].purchaseRenewalQuantity
		);
		const purchasedAddOn = storageAddOns
			.filter( ( addOn ): addOn is AddOns.AddOnMeta => addOn !== null ) // TODO: fix the related hooks so this won't be needed
			.find( ( { addOnSlug } ) => purchasedAddOnSlug === addOnSlug );
		return purchasedAddOn ?? null;
	}, [ spaceUpgradesPurchased, storageAddOns ] );
}
