import {
	FEATURE_1GB_STORAGE,
	FEATURE_6GB_STORAGE,
	FEATURE_13GB_STORAGE,
	FEATURE_50GB_STORAGE,
	FEATURE_200GB_STORAGE,
	FEATURE_P2_3GB_STORAGE,
	FEATURE_P2_13GB_STORAGE,
	PRODUCT_1GB_SPACE,
	WPComPlanStorageFeatureSlug,
} from '@automattic/calypso-products';
import { Purchases, AddOns } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';

const getIntegerVolume = (
	storageSlug?: AddOns.StorageAddOnSlug | WPComPlanStorageFeatureSlug
) => {
	switch ( storageSlug ) {
		case FEATURE_1GB_STORAGE:
			return 1;
		case FEATURE_6GB_STORAGE:
			return 6;
		case FEATURE_13GB_STORAGE:
			return 13;
		case FEATURE_50GB_STORAGE:
			return 50;
		case FEATURE_P2_3GB_STORAGE:
			return 3;
		case FEATURE_P2_13GB_STORAGE:
			return 13;
		// TODO: Remove when upgradeable storage is released in plans 2023
		case FEATURE_200GB_STORAGE:
			return 200;
		case AddOns.ADD_ON_50GB_STORAGE:
			/**
			 * Displayed string is: purchased storage + default 50GB storage + Add-On
			 * TODO: the default 50GB should be coming from plan context, not hardcoded here
			 */
			return 100;
		case AddOns.ADD_ON_100GB_STORAGE:
			/**
			 * Displayed string is: purchased storage + default 50GB storage + Add-On
			 * TODO: the default 50GB should be coming from plan context, not hardcoded here
			 */
			return 150;
		case AddOns.ADD_ON_150GB_STORAGE:
			return 200;
		case AddOns.ADD_ON_200GB_STORAGE:
			return 250;
		case AddOns.ADD_ON_250GB_STORAGE:
			return 300;
		case AddOns.ADD_ON_300GB_STORAGE:
			return 350;
		case AddOns.ADD_ON_350GB_STORAGE:
			return 400;
		default:
			return 0;
	}
};

const useStorageStringFromFeature = ( {
	storageSlug,
	siteId,
}: {
	storageSlug?: AddOns.StorageAddOnSlug | WPComPlanStorageFeatureSlug;
	siteId?: null | number | string;
} ) => {
	const translate = useTranslate();
	const spaceUpgradesPurchased = Purchases.useSitePurchasesByProductSlug( {
		siteId,
		productSlug: PRODUCT_1GB_SPACE,
	} );
	const purchasedQuantityTotal = spaceUpgradesPurchased
		? Object.values( spaceUpgradesPurchased ).reduce( ( total, current ) => {
				return total + current.purchaseRenewalQuantity;
		  }, 0 )
		: 0;

	return translate( '%(quantity)d GB', {
		args: {
			quantity: purchasedQuantityTotal + getIntegerVolume( storageSlug ),
		},
	} );
};

export default useStorageStringFromFeature;
