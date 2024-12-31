import {
	type PlanSlug,
	type WPComPlanStorageFeatureSlug,
	PRODUCT_1GB_SPACE,
} from '@automattic/calypso-products';
import { Purchases, AddOns } from '@automattic/data-stores';
import { usePlansGridContext } from '../../../../grid-context';
import { ELIGIBLE_PLANS_FOR_STORAGE_UPGRADE } from '../constants';

type Props = {
	planSlug: PlanSlug;
};

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
			return AddOns.ADD_ON_100GB_STORAGE;
		case 200:
			return AddOns.ADD_ON_100GB_STORAGE;
		case 250:
			return AddOns.ADD_ON_100GB_STORAGE;
		case 300:
			return AddOns.ADD_ON_100GB_STORAGE;
		case 350:
			return AddOns.ADD_ON_100GB_STORAGE;
		default:
			return null;
	}
};

/**
 * Returns the storage add-on upsell option to display to
 * the user on initial load. If the user has purchased a
 * storage add-on, that will be the default. Otherwise,
 * the storage included with any given plan will be used.
 */
export default function useDefaultStorageOption( {
	planSlug,
}: Props ): AddOns.StorageAddOnSlug | WPComPlanStorageFeatureSlug | undefined {
	const { siteId, gridPlansIndex } = usePlansGridContext();
	const {
		features: { storageFeature },
	} = gridPlansIndex[ planSlug ];
	const spaceUpgradesPurchased = Purchases.useSitePurchasesByProductSlug( {
		siteId,
		productSlug: PRODUCT_1GB_SPACE,
	} );
	const planStorageFeatureSlug = storageFeature?.getSlug() as WPComPlanStorageFeatureSlug;

	if ( ! spaceUpgradesPurchased ) {
		return planStorageFeatureSlug;
	}

	// storage add-on is a tiered product, so we can assume it contains only one product entry here.
	const purchasedAddOnSlug = quantityToAddOnSlug(
		Object.values( spaceUpgradesPurchased )[ 0 ].purchaseRenewalQuantity
	);

	return purchasedAddOnSlug && ELIGIBLE_PLANS_FOR_STORAGE_UPGRADE.includes( planSlug )
		? purchasedAddOnSlug
		: planStorageFeatureSlug;
}
