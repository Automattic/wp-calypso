import {
	FEATURE_1GB_STORAGE,
	FEATURE_6GB_STORAGE,
	FEATURE_13GB_STORAGE,
	FEATURE_50GB_STORAGE,
	FEATURE_200GB_STORAGE,
	FEATURE_P2_3GB_STORAGE,
	FEATURE_P2_13GB_STORAGE,
	PRODUCT_1GB_SPACE,
	PlanSlug,
	WPComPlanStorageFeatureSlug,
} from '@automattic/calypso-products';
import { Purchases, AddOns } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { ELIGIBLE_PLANS_FOR_STORAGE_UPGRADE } from '../constants';

const useStorageStringFromFeature = ( {
	storageSlug,
	siteId,
	planSlug,
}: {
	storageSlug?: AddOns.StorageAddOnSlug | WPComPlanStorageFeatureSlug;
	siteId?: null | number | string;
	planSlug: PlanSlug;
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

	switch ( storageSlug ) {
		case FEATURE_1GB_STORAGE:
			return translate( '1 GB' );
		case FEATURE_6GB_STORAGE:
			return translate( '6 GB' );
		case FEATURE_13GB_STORAGE:
			return translate( '13 GB' );
		case FEATURE_50GB_STORAGE:
			/**
			 * TODO: Don't do this here. Diverge and show the version with the green pricing next
			 */
			return translate( '%(quantity)d GB', {
				args: {
					quantity: ELIGIBLE_PLANS_FOR_STORAGE_UPGRADE.includes( planSlug )
						? purchasedQuantityTotal + 50
						: 50,
				},
			} );
		case FEATURE_P2_3GB_STORAGE:
			return translate( '3 GB' );
		case FEATURE_P2_13GB_STORAGE:
			return translate( '13 GB' );
		// TODO: Remove when upgradeable storage is released in plans 2023
		case FEATURE_200GB_STORAGE:
			return translate( '200 GB' );
		case AddOns.ADD_ON_50GB_STORAGE:
			/**
			 * Displayed string is: purchased storage + default 50GB storage + Add-On
			 * TODO: the default 50GB should be coming from plan context, not hardcoded here
			 */
			return translate( '%(quantity)d GB', {
				args: {
					quantity: purchasedQuantityTotal + 50 + 50,
				},
			} );
		case AddOns.ADD_ON_100GB_STORAGE:
			/**
			 * Displayed string is: purchased storage + default 50GB storage + Add-On
			 * TODO: the default 50GB should be coming from plan context, not hardcoded here
			 */
			return translate( '%(quantity)d GB', {
				args: {
					quantity: purchasedQuantityTotal + 50 + 100,
				},
			} );
		default:
			return null;
	}
};

export default useStorageStringFromFeature;
